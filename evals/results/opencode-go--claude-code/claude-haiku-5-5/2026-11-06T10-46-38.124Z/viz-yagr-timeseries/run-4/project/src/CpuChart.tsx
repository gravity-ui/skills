import {useEffect, useRef} from 'react';
import type {CSSProperties} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {MinimalValidConfig, YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import type {CpuFeed, CpuSample} from './cpuFeed';

export type ChartTheme = 'light' | 'dark';

const SERIES_ID = 'cpu';

/** Синяя категориальная ступень из палитры: light #2a78d6, dark #3987e5. */
const SERIES_COLOR: Record<ChartTheme, string> = {
  light: '#2a78d6',
  dark: '#3987e5',
};

function buildConfig(
  timeline: number[],
  values: number[],
  theme: ChartTheme,
): MinimalValidConfig {
  return {
    timeline,
    series: [
      {
        id: SERIES_ID,
        name: 'CPU',
        type: 'area',
        color: SERIES_COLOR[theme],
        data: values,
        formatter: (value) => (value === null ? '—' : `${Number(value).toFixed(1)}%`),
      },
    ],
    chart: {
      appearance: {theme: theme as YagrTheme, locale: 'ru'},
      size: {adaptive: true, resizeDebounceMs: 100},
    },
    legend: {show: false},
    scales: {
      x: {time: true},
      // Фиксированная шкала 0–100 %, чтобы график не «прыгал» при обновлениях.
      y: {range: () => [0, 100]},
    },
    axes: {
      x: {},
      y: {
        values: (_u, splits) => splits.map((v) => `${v}%`),
      },
    },
  };
}

export interface CpuChartProps {
  feed: CpuFeed;
  theme: ChartTheme;
}

/**
 * Интерактивный график загрузки CPU на Yagr (canvas).
 *
 * - Растягивается на весь родительский контейнер (adaptive + ResizeObserver у Yagr).
 * - Обновления от фида копятся и применяются не чаще одного раза за кадр
 *   (requestAnimationFrame), окно сдвигается на месте через splice.
 * - Тема меняется через setTheme без пересоздания графика.
 * - При размонтировании отписывается от фида, отменяет запланированный кадр
 *   и вызывает dispose() у Yagr.
 */
export function CpuChart({feed, theme}: CpuChartProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<Yagr | null>(null);
  // Тема, с которой нарисован график в данный момент.
  const drawnThemeRef = useRef<ChartTheme>(theme);

  // Создание графика, потоковое обновление и очистка ресурсов.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const {timeline, values} = feed.getHistory();
    const chart = new Yagr(root, buildConfig(timeline, values, drawnThemeRef.current));
    chartRef.current = chart;

    let pending: CpuSample[] = [];
    let frame = 0;

    const flush = () => {
      frame = 0;
      if (pending.length === 0) return;
      const batch = pending;
      pending = [];
      // Инкрементальное добавление: новые точки дописываются, а столько же старых
      // удаляется с начала — окно остаётся ровно 24 ч без полной пересборки uPlot.
      chart.setSeries(
        batch.map((s) => s.t),
        [{id: SERIES_ID, data: batch.map((s) => s.v)}],
        {incremental: true, splice: true},
      );
    };

    const unsubscribe = feed.subscribe((sample) => {
      pending.push(sample);
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
      pending = [];
      chart.dispose();
      chartRef.current = null;
    };
  }, [feed]);

  // Смена светлой/тёмной темы без пересоздания графика.
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart || drawnThemeRef.current === theme) return;
    drawnThemeRef.current = theme;
    chart.setTheme(theme);
    chart.setSeries(SERIES_ID, {color: SERIES_COLOR[theme]});
  }, [theme]);

  return (
    <div
      ref={rootRef}
      style={
        {
          width: '100%',
          height: '100%',
          // Фон canvas совпадает с фоном темы страницы, а не с фиксированным цветом Yagr.
          '--yagr-background': 'var(--g-color-base-background)',
        } as CSSProperties
      }
    />
  );
}
