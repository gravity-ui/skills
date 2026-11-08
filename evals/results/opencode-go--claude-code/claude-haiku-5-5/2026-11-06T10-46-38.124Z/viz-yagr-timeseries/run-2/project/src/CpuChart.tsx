import { memo, useEffect, useRef } from 'react';
import Yagr, { type AreaSeriesOptions, type MinimalValidConfig, type RawSerieData } from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';

import type { CpuFeed } from './cpuFeed';

export type ChartTheme = 'light' | 'dark';

const SERIES_ID = 'cpu';
/** Слот 1 категориальной палитры (blue): линия — сплошная, заливка — подложка ~10%. */
const SERIES_STYLE: Record<ChartTheme, { line: string; fill: string }> = {
  light: { line: '#2a78d6', fill: 'rgba(42, 120, 214, 0.1)' },
  dark: { line: '#3987e5', fill: 'rgba(57, 135, 229, 0.1)' },
};
const AXIS_FONT = '11px system-ui, -apple-system, "Segoe UI", sans-serif';

function createSeries(feed: CpuFeed, theme: ChartTheme): RawSerieData<AreaSeriesOptions> {
  const style = SERIES_STYLE[theme];
  return {
    id: SERIES_ID,
    name: 'CPU',
    type: 'area',
    // В Yagr для area заливка берётся из color, а контур из lineColor (по умолчанию тёмный).
    color: style.fill,
    lineColor: style.line,
    lineWidth: 2,
    precision: 1,
    formatter: (value) => (value == null ? '' : `${Number(value).toFixed(1)}%`),
    data: feed.values.slice(),
  };
}

const timeLabel = (t: number) => new Date(t).toLocaleTimeString('ru-RU');

function createConfig(feed: CpuFeed, theme: ChartTheme): MinimalValidConfig {
  return {
    chart: {
      appearance: { theme, locale: 'ru' },
      size: { adaptive: true, resizeDebounceMs: 100 },
    },
    timeline: feed.timeline.slice(),
    series: [createSeries(feed, theme)],
    // Одна серия: легенда не нужна, заголовок страницы называет показатель.
    legend: { show: false },
    // Нейтральный crosshair из токенов панели. Цвет Yagr по умолчанию красный, а красный
    // в палитре зарезервирован за статусом «critical».
    cursor: {
      x: { visible: true, style: '1px solid var(--cpu-ink-3)' },
      y: { visible: false },
    },
    tooltip: {
      title: (data) => timeLabel(data.x),
    },
    scales: {
      x: { time: true },
      y: { min: 0, max: 100 },
    },
    axes: {
      x: { scale: 'x', font: AXIS_FONT },
      y: {
        scale: 'y',
        font: AXIS_FONT,
        splitsCount: 5,
        precision: 0,
        values: (_u, splits) => splits.map((v) => `${v}%`),
      },
    },
  };
}

interface CpuChartProps {
  feed: CpuFeed;
  theme: ChartTheme;
}

function CpuChartView({ feed, theme }: CpuChartProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    // Тема задаётся при создании: смена темы пересоздаёт график. Это редкое
    // событие, и так не нужно сверять внутренние цвета Yagr с новой палитрой.
    const chart = new Yagr(root, createConfig(feed, theme));

    // Скользящее окно фиксированной длины: одна точка добавляется, одна удаляется.
    // Такой путь обновляет график без полного пересоздания uPlot.
    const unsubscribe = feed.subscribe((sample) => {
      chart.setSeries([sample.t], [{ id: SERIES_ID, data: [sample.v] }], {
        incremental: true,
        splice: true,
      });
    });

    return () => {
      unsubscribe();
      chart.dispose();
    };
  }, [feed, theme]);

  return (
    <div
      ref={rootRef}
      className="cpu-chart"
      role="img"
      aria-label="График загрузки CPU за последние сутки"
    />
  );
}

/** memo: родитель перерисовывается на каждом замере, а сам график — только при смене feed или темы. */
export const CpuChart = memo(CpuChartView);
