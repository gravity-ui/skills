import '@gravity-ui/yagr/index.css';
import './CpuLoadChart.css';

import * as React from 'react';
import type {
  AreaSeriesOptions,
  DataSeriesExtended,
  MinimalValidConfig,
  RawSerieData,
  YagrTheme,
} from '@gravity-ui/yagr';
import YagrComponent from '@gravity-ui/yagr/react';
import type {YagrReactRef} from '@gravity-ui/yagr/react';
import {Alert, Button, Flex, Label, Loader, Text, useThemeValue} from '@gravity-ui/uikit';

import type {CpuLoadBatch, CpuLoadSource} from './cpuLoadSource';

const WINDOW_MS = 24 * 60 * 60 * 1000;
/** Как часто накопленные точки применяются к графику. Отрисовка не чаще раза в секунду. */
const FLUSH_INTERVAL_MS = 1000;
/** Максимальный размер одной порции при догоняющем обновлении (после паузы/фоновой вкладки). */
const MAX_CHUNK = 10_000;
const SERIES_ID = 'cpu';

/**
 * Цвета серии — семантические токены Gravity UI. Yagr резолвит `var(--…)` через
 * getComputedStyle в момент конфигурирования серии, поэтому при смене темы их
 * нужно передать повторно (см. эффект темы ниже).
 */
const SERIES_COLORS: Partial<RawSerieData<AreaSeriesOptions>> = {
  color: 'var(--g-color-base-info-light)',
  lineColor: 'var(--g-color-line-info)',
};

const YAGR_THEMES: readonly YagrTheme[] = ['light', 'dark', 'light-hc', 'dark-hc'];

function toYagrTheme(theme: string): YagrTheme {
  if ((YAGR_THEMES as readonly string[]).includes(theme)) {
    return theme as YagrTheme;
  }
  return theme.includes('dark') ? 'dark' : 'light';
}

const formatPercent = (value: string | number | null) =>
  typeof value === 'number' ? `${value.toFixed(1)} %` : '—';

function buildConfig(history: CpuLoadBatch, theme: YagrTheme): MinimalValidConfig {
  const series: RawSerieData<AreaSeriesOptions> = {
    id: SERIES_ID,
    name: 'CPU',
    type: 'area',
    data: history.values,
    lineWidth: 2,
    ...SERIES_COLORS,
  };

  return {
    timeline: history.timeline,
    series: [series],
    chart: {
      appearance: {theme, locale: 'ru'},
      // Выделение области мышью масштабирует график по X.
      select: {zoom: true},
      size: {adaptive: true},
    },
    scales: {y: {min: 0, max: 100}},
    axes: {
      y: {values: (_u, splits) => splits.map((v) => `${v} %`)},
    },
    legend: {show: false},
    tooltip: {
      // Сохраняем стандартный вид тултипа и добавляем свой класс для темизации.
      className: 'yagr-tooltip_default cpu-load-chart__tooltip',
      // Не сбрасывать тултип на каждом realtime-обновлении — иначе он мигает под курсором.
      onUpdate: 'none',
      precision: 1,
      value: formatPercent,
    },
  };
}

interface CpuLoadStats {
  current: number | null;
  avg: number | null;
  max: number | null;
}

function computeStats(values: DataSeriesExtended): CpuLoadStats {
  let sum = 0;
  let count = 0;
  let max = -Infinity;
  let current: number | null = null;
  for (const v of values) {
    if (typeof v !== 'number') {
      continue;
    }
    sum += v;
    count += 1;
    if (v > max) {
      max = v;
    }
    current = v;
  }
  return count ? {current, avg: sum / count, max} : {current: null, avg: null, max: null};
}

type LoadState =
  | {status: 'loading'}
  | {status: 'error'; message: string}
  | {status: 'ready'; config: MinimalValidConfig};

export interface CpuLoadChartProps {
  source: CpuLoadSource;
  className?: string;
}

export function CpuLoadChart({source, className}: CpuLoadChartProps) {
  const theme = toYagrTheme(useThemeValue());
  const themeRef = React.useRef(theme);
  themeRef.current = theme;

  const chartId = React.useId();
  const yagrRef = React.useRef<YagrReactRef>(null);
  const bufferRef = React.useRef<CpuLoadBatch>({timeline: [], values: []});
  const liveRef = React.useRef(true);

  const [attempt, setAttempt] = React.useState(0);
  const [state, setState] = React.useState<LoadState>({status: 'loading'});
  const [isLive, setLive] = React.useState(true);
  const [stats, setStats] = React.useState<CpuLoadStats | null>(null);

  /** Применяет накопленные точки к графику одной перерисовкой. Работает только через refs. */
  const flush = React.useCallback(() => {
    const chart = yagrRef.current?.yagr();
    const buffer = bufferRef.current;
    if (!chart || !liveRef.current || document.hidden || buffer.timeline.length === 0) {
      return;
    }
    bufferRef.current = {timeline: [], values: []};

    const current = chart.config.timeline;
    const lastTs = current.length ? current[current.length - 1] : -Infinity;
    const newest = buffer.timeline[buffer.timeline.length - 1];
    // Отбрасываем то, что уже есть в истории, и то, что не попадёт в окно 24 ч.
    const lowerBound = Math.max(lastTs, newest - WINDOW_MS);
    let start = 0;
    while (start < buffer.timeline.length && buffer.timeline[start] <= lowerBound) {
      start += 1;
    }
    if (start === buffer.timeline.length) {
      return;
    }

    // batch: все порции → один пересчёт данных и одна перерисовка uPlot.
    chart.batch(() => {
      for (let i = start; i < buffer.timeline.length; i += MAX_CHUNK) {
        const timeline = buffer.timeline.slice(i, i + MAX_CHUNK);
        const values = buffer.values.slice(i, i + MAX_CHUNK);
        const tl = chart.config.timeline;
        // Пока окно не заполнено — только дописываем; дальше — скользящее окно
        // постоянного размера (splice удаляет столько же старых точек, сколько добавлено).
        const windowFull =
          tl.length > 0 && tl[0] <= timeline[timeline.length - 1] - WINDOW_MS;
        chart.setSeries(timeline, [{id: SERIES_ID, data: values}], {
          incremental: true,
          splice: windowFull,
        });
      }
    });

    setStats(computeStats(chart.config.series[0]?.data ?? []));
  }, []);

  // Загрузка истории + подписка на live-поток. Подписываемся сразу, чтобы не потерять
  // точки, пришедшие во время загрузки истории; дубликаты отсекаются в flush().
  React.useEffect(() => {
    const controller = new AbortController();
    bufferRef.current = {timeline: [], values: []};
    liveRef.current = true;
    setLive(true);
    setStats(null);
    setState({status: 'loading'});

    const unsubscribe = source.subscribe(({timeline, values}) => {
      const buffer = bufferRef.current;
      buffer.timeline.push(...timeline);
      buffer.values.push(...values);
      // Ограничиваем буфер окном 24 ч (актуально при долгой паузе или скрытой вкладке).
      const minTs = buffer.timeline[buffer.timeline.length - 1] - WINDOW_MS;
      if (buffer.timeline[0] < minTs) {
        const cut = buffer.timeline.findIndex((ts) => ts >= minTs);
        buffer.timeline.splice(0, cut);
        buffer.values.splice(0, cut);
      }
    });

    const to = Date.now();
    source.loadHistory({from: to - WINDOW_MS, to, signal: controller.signal}).then(
      (history) => {
        if (controller.signal.aborted) {
          return;
        }
        setStats(computeStats(history.values));
        setState({status: 'ready', config: buildConfig(history, themeRef.current)});
      },
      (error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : String(error),
        });
      },
    );

    const timer = window.setInterval(flush, FLUSH_INTERVAL_MS);
    // В фоновой вкладке не рисуем; при возвращении — сразу догоняем.
    const onVisibilityChange = () => {
      if (!document.hidden) {
        flush();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      controller.abort();
      unsubscribe();
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      bufferRef.current = {timeline: [], values: []};
    };
  }, [source, attempt, flush]);

  const isReady = state.status === 'ready';

  // Смена темы без пересоздания графика: обновляем тему Yagr и перерезолвим цвета серии.
  // ThemeProvider меняет класс темы в useLayoutEffect, т.е. до этого эффекта, — токены уже актуальны.
  React.useEffect(() => {
    const chart = yagrRef.current?.yagr();
    if (!isReady || !chart) {
      return;
    }
    chart.batch((batch) => {
      chart.setTheme(theme);
      chart.setSeries(SERIES_ID, SERIES_COLORS);
      batch.redraw = [true, true];
    });
  }, [theme, isReady]);

  // Пользователь выделил область → график масштабирован, live-обновления ставим на паузу,
  // чтобы новые точки не сбрасывали масштаб. Данные продолжают копиться в буфере.
  const handleSelect = React.useCallback(() => {
    liveRef.current = false;
    setLive(false);
  }, []);

  const goLive = React.useCallback(() => {
    liveRef.current = true;
    setLive(true);
    flush();
    const chart = yagrRef.current?.yagr();
    const tl = chart?.config.timeline;
    if (chart && tl && tl.length > 1) {
      chart.uplot.setScale('x', {min: tl[0], max: tl[tl.length - 1]});
    }
  }, [flush]);

  const retry = React.useCallback(() => setAttempt((n) => n + 1), []);

  let body: React.ReactNode;
  if (state.status === 'loading') {
    body = (
      <Flex className="cpu-load-chart__placeholder" alignItems="center" justifyContent="center">
        <Loader size="m" />
      </Flex>
    );
  } else if (state.status === 'error') {
    body = (
      <Flex className="cpu-load-chart__placeholder" alignItems="center" justifyContent="center">
        <Alert
          theme="danger"
          title="Не удалось загрузить данные о загрузке CPU"
          message={state.message}
          actions={[{text: 'Повторить', handler: retry}]}
        />
      </Flex>
    );
  } else {
    body = (
      // Двойной клик: uPlot сбрасывает масштаб, а мы возвращаемся к live-режиму.
      <div className="cpu-load-chart__plot-wrapper" onDoubleClick={goLive}>
        <YagrComponent
          id={chartId}
          ref={yagrRef}
          className="cpu-load-chart__plot"
          config={state.config}
          onSelect={handleSelect}
        />
      </div>
    );
  }

  return (
    <div className={['cpu-load-chart', className].filter(Boolean).join(' ')}>
      <Flex justifyContent="space-between" alignItems="flex-start" gap={4} wrap>
        <Flex direction="column" gap={1} style={{flex: 1, minWidth: 0}}>
          <Text variant="subheader-3">Загрузка CPU</Text>
          <Text variant="body-1" color="secondary">
            За последние 24 часа, обновление каждую секунду
          </Text>
        </Flex>
        <Flex alignItems="center" gap={2} style={{flexShrink: 0}}>
          {isLive ? (
            <Label theme="info">Реальное время</Label>
          ) : (
            <React.Fragment>
              <Label theme="normal">Пауза</Label>
              <Button view="outlined" size="s" onClick={goLive}>
                Вернуться к реальному времени
              </Button>
            </React.Fragment>
          )}
        </Flex>
      </Flex>

      <Flex gap={6} wrap>
        <Stat label="Сейчас" value={stats?.current} />
        <Stat label="Среднее за 24 ч" value={stats?.avg} />
        <Stat label="Пик за 24 ч" value={stats?.max} />
      </Flex>

      <div className="cpu-load-chart__body">{body}</div>

      <Text variant="caption-2" color="hint">
        Выделите область мышью, чтобы приблизить. Двойной клик — сбросить масштаб.
      </Text>
    </div>
  );
}

function Stat({label, value}: {label: string; value: number | null | undefined}) {
  return (
    <Flex direction="column" gap={0.5}>
      <Text variant="caption-2" color="secondary">
        {label}
      </Text>
      <Text variant="subheader-3">{value == null ? '—' : formatPercent(value)}</Text>
    </Flex>
  );
}
