import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import React from 'react';
import Yagr from '@gravity-ui/yagr';
import type {
  LineSeriesOptions,
  MinimalValidConfig,
  RawSerieData,
  TooltipRenderOptions,
  YagrTheme,
} from '@gravity-ui/yagr';
import {useThemeType, useThemeValue} from '@gravity-ui/uikit';

import {DAY_MS, type CpuLoadBatch, type CpuLoadSource} from './cpuLoadSource';
import {escapeHtml, formatDateTime, formatPercent} from './format';
import {planWindowUpdate} from './slidingWindow';

const SERIES_ID = 'cpu';
const SERIES_NAME = 'Загрузка CPU';

/**
 * Цвет линии по типу темы. Взят из токенов Gravity UI
 * (`--g-color-private-blue-600-solid` светлой и `--g-color-private-blue-550-solid` тёмной темы)
 * и проверен валидатором палитры на контраст с поверхностями обеих тем.
 */
const SERIES_COLOR: Record<'light' | 'dark', string> = {
  light: '#348bdc',
  dark: '#3697f1',
};

/** Canvas не умеет CSS-переменные, поэтому шрифт осей задаём той же гарнитурой, что и Gravity UI. */
const AXIS_FONT = '11px "Inter", "Helvetica Neue", Helvetica, Arial, sans-serif';

export interface CpuLoadChartProps {
  source: CpuLoadSource;
  /** Размер скользящего окна (по умолчанию — сутки). */
  windowMs?: number;
  className?: string;
}

export interface CpuLoadChartHandle {
  /** Текущий экземпляр Yagr (null до монтирования и после размонтирования). */
  getChart(): Yagr | null;
}

function toYagrTheme(themeValue: string, themeType: 'light' | 'dark'): YagrTheme {
  return themeValue.endsWith('-hc') ? `${themeType}-hc` : themeType;
}

function renderTooltip(data: TooltipRenderOptions): string {
  const row = data.scales[0]?.rows[0];
  const value = row && row.value !== null ? formatPercent(row.value) : null;
  return (
    `<div class="cpu-load-chart__tooltip-value">${value === null ? 'нет данных' : escapeHtml(value)}</div>` +
    `<div class="cpu-load-chart__tooltip-time">${escapeHtml(formatDateTime(data.x))}</div>`
  );
}

function buildSeries(data: number[], themeType: 'light' | 'dark'): RawSerieData {
  const series: RawSerieData<LineSeriesOptions> = {
    id: SERIES_ID,
    name: SERIES_NAME,
    type: 'line',
    color: SERIES_COLOR[themeType],
    width: 2,
    interpolation: 'linear',
    spanGaps: false,
    precision: 1,
    formatter: (value) => formatPercent(value),
    data,
  };
  return series;
}

function buildConfig(snapshot: CpuLoadBatch, theme: YagrTheme, themeType: 'light' | 'dark'): MinimalValidConfig {
  return {
    timeline: snapshot.timeline,
    series: [buildSeries(snapshot.values, themeType)],
    chart: {
      // Размер берётся из контейнера, пересчёт — через ResizeObserver внутри Yagr.
      size: {adaptive: true, resizeDebounceMs: 80},
      appearance: {theme, locale: 'ru'},
      // Данные приходят постоянно и сбрасывали бы зум при каждом обновлении.
      select: {zoom: false},
    },
    scales: {
      y: {min: 0, max: 100, range: 'nice'},
    },
    axes: {
      x: {font: AXIS_FONT},
      y: {
        font: AXIS_FONT,
        values: (_u, ticks) => ticks.map((tick) => `${tick}%`),
      },
    },
    cursor: {
      x: {visible: true, style: '1px solid var(--g-color-line-generic-accent)'},
      y: {visible: false},
      markersSize: 8,
      snapToValues: 'closest',
    },
    tooltip: {
      show: true,
      strategy: 'none',
      className: 'cpu-load-chart__tooltip',
      render: renderTooltip,
    },
    legend: {show: false},
    markers: {show: false},
  };
}

/**
 * Интерактивный график загрузки CPU на базе Yagr (uPlot, canvas).
 *
 * Производительность:
 *  - начальный набор (десятки тысяч точек) рисуется один раз;
 *  - новые точки накапливаются и применяются не чаще одного раза за кадр,
 *    в установившемся режиме через инкрементальный `setSeries` без пересоздания uPlot;
 *  - компонент не хранит данные в state, поэтому React не перерисовывает его на каждом тике.
 *
 * Ресурсы (подписка на источник, rAF, ResizeObserver, DOM тултипа) освобождаются при размонтировании.
 */
export const CpuLoadChart = React.memo(
  React.forwardRef<CpuLoadChartHandle, CpuLoadChartProps>(function CpuLoadChart(
    {source, windowMs = DAY_MS, className},
    ref,
  ) {
    const rootRef = React.useRef<HTMLDivElement>(null);
    const chartRef = React.useRef<Yagr | null>(null);

    React.useImperativeHandle(ref, () => ({getChart: () => chartRef.current}), []);

    const themeValue = useThemeValue();
    const themeType = useThemeType();
    const yagrTheme = toYagrTheme(themeValue, themeType);

    // Тема, с которой был создан/обновлён экземпляр. Через ref, чтобы эффект создания
    // графика не зависел от темы и не пересоздавал его при переключении.
    const appliedThemeRef = React.useRef({yagrTheme, themeType});
    appliedThemeRef.current = {yagrTheme, themeType};

    React.useEffect(() => {
      const root = rootRef.current;
      if (!root) {
        return undefined;
      }

      const {yagrTheme: initialTheme, themeType: initialType} = appliedThemeRef.current;
      const chart = new Yagr(root, buildConfig(source.getSnapshot(), initialTheme, initialType));
      chartRef.current = chart;

      let pending: CpuLoadBatch = {timeline: [], values: []};
      let frame = 0;

      const flush = () => {
        frame = 0;
        const batch = pending;
        if (batch.timeline.length === 0) {
          return;
        }
        pending = {timeline: [], values: []};

        const plan = planWindowUpdate(chart.config.timeline, batch.timeline, windowMs);
        if (plan.mode === 'incremental') {
          chart.setSeries(batch.timeline, [{id: SERIES_ID, data: batch.values}], {
            incremental: true,
            splice: true,
          });
          return;
        }

        // Редкий путь: пакет после паузы или пустое окно — пересобираем окно целиком.
        const current = chart.config.series[0];
        const currentValues = (current?.data ?? []) as number[];
        const timeline = chart.config.timeline.slice(plan.stale).concat(batch.timeline);
        const values = currentValues.slice(plan.stale).concat(batch.values);
        chart.setSeries(timeline, [{...buildSeries(values, appliedThemeRef.current.themeType)}], {
          incremental: false,
        });
      };

      const unsubscribe = source.subscribe((batch) => {
        for (let i = 0; i < batch.timeline.length; i++) {
          pending.timeline.push(batch.timeline[i]);
          pending.values.push(batch.values[i]);
        }
        // Сколько бы пакетов ни пришло, перерисовка — не чаще одного раза за кадр.
        // В скрытой вкладке rAF не выполняется, точки копятся и применяются одним пакетом.
        if (frame === 0) {
          frame = requestAnimationFrame(flush);
        }
      });

      return () => {
        unsubscribe();
        if (frame !== 0) {
          cancelAnimationFrame(frame);
          frame = 0;
        }
        chartRef.current = null;
        // Yagr отключает ResizeObserver, снимает обработчики, удаляет тултип и уничтожает uPlot.
        chart.dispose();
      };
    }, [source, windowMs]);

    React.useEffect(() => {
      const chart = chartRef.current;
      if (!chart || chart.utils.theme.theme === yagrTheme) {
        return;
      }
      chart.setTheme(yagrTheme);
      chart.setSeries(SERIES_ID, {color: SERIES_COLOR[themeType]});
    }, [yagrTheme, themeType]);

    return (
      <div
        ref={rootRef}
        className={['cpu-load-chart', className].filter(Boolean).join(' ')}
        role="img"
        aria-label="График загрузки CPU за последние сутки"
      />
    );
  }),
);
