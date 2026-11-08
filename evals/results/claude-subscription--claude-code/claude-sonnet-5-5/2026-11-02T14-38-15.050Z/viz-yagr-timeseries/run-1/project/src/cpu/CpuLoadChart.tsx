import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import React from 'react';
import Yagr, {type TooltipRenderOptions} from '@gravity-ui/yagr';
import {Button, Text, useThemeType} from '@gravity-ui/uikit';

import type {CpuPoints, CpuSource} from './cpuSource';

type ThemeType = 'light' | 'dark';

const SERIES_ID = 'cpu';
/** Цвет серии под каждую тему (проверены validate_palette: контраст ≥ 3:1 к поверхности). */
const SERIES_COLOR: Record<ThemeType, string> = {light: '#2a78d6', dark: '#3987e5'};
/** Максимум элементов в одном `push(...spread)`, чтобы не упереться в лимит аргументов. */
const MAX_CHUNK = 8000;

const percent = new Intl.NumberFormat('ru-RU', {minimumFractionDigits: 1, maximumFractionDigits: 1});
const formatPercent = (v: number) => `${percent.format(v)}%`;
const timeFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Yagr рендерит тултип HTML-строкой, поэтому всё динамическое экранируем. */
function renderTooltip({scales, x}: TooltipRenderOptions): string {
  const row = scales[0]?.rows[0];
  if (!row) return '';
  const value = typeof row.displayY === 'number' ? formatPercent(row.displayY) : '—';
  return (
    `<div class="cpu-tooltip__time">${escapeHtml(timeFormat.format(x))}</div>` +
    `<div class="cpu-tooltip__row">` +
    `<span class="cpu-tooltip__key" style="background:${escapeHtml(row.color)}"></span>` +
    `<span class="cpu-tooltip__value">${escapeHtml(value)}</span>` +
    `<span class="cpu-tooltip__name">CPU</span>` +
    `</div>`
  );
}

interface Stats {
  current: number | null;
  avg: number | null;
  max: number | null;
}

function computeStats(values: ReadonlyArray<number | string | null>): Stats {
  let sum = 0;
  let count = 0;
  let max = -Infinity;
  let current: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const v = values[i];
    if (typeof v !== 'number') continue;
    sum += v;
    count++;
    if (v > max) max = v;
    current = v;
  }
  return count ? {current, avg: sum / count, max} : {current: null, avg: null, max: null};
}

export interface CpuLoadChartProps {
  source: CpuSource;
  className?: string;
}

export function CpuLoadChart({source, className}: CpuLoadChartProps) {
  const theme = useThemeType() as ThemeType;
  const plotRef = React.useRef<HTMLDivElement>(null);
  const chartRef = React.useRef<Yagr | null>(null);
  const resetZoomRef = React.useRef<() => void>(() => {});
  /** Тема, с которой график создан/обновлён в последний раз. */
  const appliedThemeRef = React.useRef<ThemeType>(theme);
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  const [zoomed, setZoomed] = React.useState(false);
  const [stats, setStats] = React.useState<Stats | null>(null);

  // Жизненный цикл графика: создание, подписка на данные, ресайз и полная очистка.
  React.useEffect(() => {
    const plot = plotRef.current;
    if (!plot) return;

    const history = source.getHistory();
    if (!history.timeline.length) return;

    const capacity = history.timeline.length;
    const initialTheme = themeRef.current;
    let length = capacity;
    let disposed = false;
    let isZoomed = false;
    let rafId = 0;
    let pending: CpuPoints = {timeline: [], values: []};

    // Отдельный хост на каждый экземпляр: чистое удаление и безопасность StrictMode.
    const host = document.createElement('div');
    host.className = 'cpu-chart__host';
    plot.appendChild(host);

    const chart = new Yagr(host, {
      timeline: history.timeline,
      series: [
        {
          id: SERIES_ID,
          name: 'CPU',
          type: 'line',
          data: history.values,
          color: SERIES_COLOR[initialTheme],
        },
      ],
      chart: {
        // Ресайз делаем сами (см. ниже): так его можно полностью остановить при размонтировании.
        series: {type: 'line', width: 1.5, spanGaps: false},
        size: {adaptive: false},
        appearance: {theme: initialTheme, locale: 'ru'},
        select: {zoom: true, minWidth: 8},
      },
      markers: {show: false},
      scales: {
        x: {},
        y: {min: 0, max: 100},
      },
      axes: {
        x: {},
        y: {
          splitsCount: 5,
          precision: 0,
          values: (_u, splits) => splits.map((v) => `${v}%`),
        },
      },
      cursor: {
        x: {visible: true, style: '1px dashed var(--cpu-chart-crosshair)'},
        y: {visible: false},
        markersSize: 8,
        snapToValues: 'closest',
      },
      tooltip: {
        show: true,
        tracking: 'sticky',
        strategy: 'none',
        pinable: false,
        maxLines: 1,
        highlight: false,
        sum: false,
        render: renderTooltip,
        className: `cpu-tooltip cpu-tooltip_${initialTheme}`,
      },
      hooks: {
        scaleUpdate: [() => syncZoom()],
        error: [({error, stage}) => console.error(`CpuLoadChart: ошибка на стадии "${stage}"`, error)],
      },
    });
    chartRef.current = chart;
    appliedThemeRef.current = initialTheme;

    const refreshStats = () => {
      if (!disposed) setStats(computeStats(chart.config.series[0].data));
    };

    // ——— Живые обновления ———

    const pushChunk = (timeline: number[], values: (number | null)[], splice: boolean) => {
      chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {incremental: true, splice});
    };

    /** Добавляет точки в конец окна; когда окно заполнено, столько же старых точек сдвигается. */
    const apply = (points: CpuPoints) => {
      let {timeline, values} = points;
      const room = capacity - length;
      if (room > 0) {
        const n = Math.min(room, timeline.length);
        pushChunk(timeline.slice(0, n), values.slice(0, n), false);
        length += n;
        timeline = timeline.slice(n);
        values = values.slice(n);
      }
      for (let i = 0; i < timeline.length; i += MAX_CHUNK) {
        pushChunk(timeline.slice(i, i + MAX_CHUNK), values.slice(i, i + MAX_CHUNK), true);
      }
    };

    const flush = () => {
      rafId = 0;
      if (disposed || isZoomed || !pending.timeline.length) return;
      const batch = pending;
      pending = {timeline: [], values: []};
      apply(batch);
      refreshStats();
    };

    /** Все апдейты за кадр сливаются в одну перерисовку; в фоновой вкладке rAF сам встаёт на паузу. */
    const scheduleFlush = () => {
      if (!rafId && !disposed && !isZoomed) rafId = requestAnimationFrame(flush);
    };

    const unsubscribe = source.subscribe((points) => {
      pending = {
        timeline: pending.timeline.concat(points.timeline),
        values: pending.values.concat(points.values),
      };
      scheduleFlush();
    });

    // ——— Зум ———
    // Любое setData в uPlot сбрасывает масштаб, поэтому пока график приближен, живые точки копим
    // в буфере и применяем после сброса зума (кнопка или двойной клик).

    function syncZoom() {
      const u = chart.uplot;
      const t = u?.data?.[0];
      if (!t || !t.length) return;
      const {min, max} = u.scales.x;
      const eps = source.stepMs / 2;
      const next = min != null && max != null && (min > t[0] + eps || max < t[t.length - 1] - eps);
      if (next === isZoomed) return;
      isZoomed = next;
      setZoomed(next);
      if (!next) scheduleFlush();
    }

    resetZoomRef.current = () => {
      const t = chart.uplot.data[0];
      if (t?.length) chart.uplot.setScale('x', {min: t[0], max: t[t.length - 1]});
    };

    // ——— Ресайз по контейнеру ———

    let size = {w: plot.clientWidth, h: plot.clientHeight};
    let resizeRaf = 0;
    const resizeObserver = new ResizeObserver(() => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        if (disposed) return;
        const w = plot.clientWidth;
        const h = plot.clientHeight;
        if (w === size.w && h === size.h) return;
        size = {w, h};
        if (w > 0 && h > 0) {
          chart.plugins.tooltip?.reset();
          chart.reflow();
        }
      });
    });
    resizeObserver.observe(plot);

    refreshStats();

    return () => {
      disposed = true;
      unsubscribe();
      resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      cancelAnimationFrame(resizeRaf);
      resetZoomRef.current = () => {};
      chartRef.current = null;
      chart.dispose(); // uPlot, слушатели мыши/окна, DOM тултипа
      host.remove();
      pending = {timeline: [], values: []};
      setZoomed(false);
    };
  }, [source]);

  // Смена темы: без пересоздания графика.
  React.useEffect(() => {
    const chart = chartRef.current;
    if (!chart || appliedThemeRef.current === theme) return;
    appliedThemeRef.current = theme;
    chart.setTheme(theme);
    chart.setSeries(SERIES_ID, {color: SERIES_COLOR[theme]});
    chart.plugins.tooltip?.updateOptions({className: `cpu-tooltip cpu-tooltip_${theme}`});
  }, [theme]);

  const label =
    stats && stats.current !== null
      ? `График загрузки CPU за последние 24 часа. Сейчас ${formatPercent(stats.current)}, ` +
        `среднее ${formatPercent(stats.avg ?? 0)}, максимум ${formatPercent(stats.max ?? 0)}.`
      : 'График загрузки CPU за последние 24 часа. Нет данных.';

  return (
    <section className={['cpu-chart', className].filter(Boolean).join(' ')}>
      <header className="cpu-chart__header">
        <div className="cpu-chart__title">
          <Text variant="subheader-2">Загрузка CPU</Text>
          <Text variant="body-1" color="secondary">
            Последние 24 часа
            {zoomed
              ? ' · обновление приостановлено, пока график приближен'
              : ' · обновляется в реальном времени'}
          </Text>
        </div>
        <dl className="cpu-chart__stats">
          <Stat label="Сейчас" value={stats?.current} />
          <Stat label="Среднее" value={stats?.avg} />
          <Stat label="Максимум" value={stats?.max} />
        </dl>
        <Button
          view="outlined"
          size="m"
          className="cpu-chart__reset"
          disabled={!zoomed}
          onClick={() => resetZoomRef.current()}
        >
          Сбросить масштаб
        </Button>
      </header>
      <div
        ref={plotRef}
        className="cpu-chart__plot"
        role="img"
        aria-label={label}
        title="Выделите область мышью, чтобы приблизить; двойной клик — сбросить"
      />
    </section>
  );
}

function Stat({label, value}: {label: string; value: number | null | undefined}) {
  return (
    <div className="cpu-chart__stat">
      <dt>
        <Text variant="body-1" color="secondary">
          {label}
        </Text>
      </dt>
      <dd>
        <Text variant="subheader-3">{typeof value === 'number' ? formatPercent(value) : '—'}</Text>
      </dd>
    </div>
  );
}
