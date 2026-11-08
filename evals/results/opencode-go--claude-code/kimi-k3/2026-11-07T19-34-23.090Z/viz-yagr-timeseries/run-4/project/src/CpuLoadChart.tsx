import {useEffect, useRef} from 'react';
import Yagr from 'yagr';
import type {MinimalValidConfig, RawSerieData, YagrTheme} from 'yagr';
import 'yagr/dist/index.css';

import './cpu-chart.css';
import {
  SAMPLE_MS,
  computeStats,
  createCpuFeed,
  generateInitialWindow,
  type CpuStats,
} from './cpuData';

const SERIES_ID = 'cpu';

/**
 * Validated single-series palette (light surface #fcfcfb / dark #1a1a19,
 * >= 3:1 contrast in both modes). The area fill is a translucent shade of
 * the same hue; the readable mark is the 2px line on top.
 */
const SERIES_LINE: Record<YagrTheme, string> = {
  light: '#2a78d6',
  dark: '#3987e5',
};
const SERIES_FILL: Record<YagrTheme, string> = {
  light: 'rgba(42, 120, 214, 0.14)',
  dark: 'rgba(57, 135, 229, 0.22)',
};

function buildConfig(
  timeline: number[],
  data: (number | null)[],
  theme: YagrTheme,
): MinimalValidConfig {
  return {
    timeline,
    series: [
      // RawSerieData is an Omit over a union and loses area-specific keys,
      // hence the cast — these are valid AreaSeriesOptions fields.
      {
        id: SERIES_ID,
        name: 'Загрузка CPU',
        type: 'area',
        scale: 'y',
        color: SERIES_FILL[theme],
        lineColor: SERIES_LINE[theme],
        lineWidth: 2,
        data,
      } as RawSerieData,
    ],
    chart: {
      appereance: {theme, locale: 'ru'},
      size: {
        // Stretch to the container and redraw (debounced) when it resizes.
        adaptive: true,
        resizeDebounceMs: 100,
      },
      // Drag on the plot zooms into the range, double-click resets.
      select: {zoom: true},
      series: {type: 'area', interpolation: 'linear'},
      timeMultiplier: 1, // timestamps are in milliseconds
    },
    scales: {
      y: {min: 0, max: 100},
    },
    axes: {
      y: {
        values: (_u, splits) => splits.map((s) => (s == null ? null : `${Math.round(s)}%`)),
      },
    },
    // Single series — the card title names the metric, no legend box needed.
    legend: {show: false},
    tooltip: {
      show: true,
      value: (v) => (v == null ? '—' : `${Number(v).toFixed(1)}%`),
    },
  };
}

export interface CpuLoadChartProps {
  theme: YagrTheme;
  /** Called once per second with stats recomputed over the visible window. */
  onStats?: (stats: CpuStats) => void;
}

/**
 * Interactive CPU-load chart.
 *
 * The chart instance is created once per mount and updated imperatively:
 * realtime ticks use incremental+splice setSeries (append the new sample,
 * drop the oldest — sliding 24h window) instead of recreating the chart.
 * React re-renders never touch the canvas.
 */
export function CpuLoadChart({theme, onStats}: CpuLoadChartProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<Yagr | null>(null);

  // Always point at the latest callback without re-running the mount effect.
  const onStatsRef = useRef(onStats);
  useEffect(() => {
    onStatsRef.current = onStats;
  }, [onStats]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const feed = createCpuFeed();
    const {timeline, values} = generateInitialWindow(feed);
    const chart = new Yagr(root, buildConfig(timeline, values, theme));
    chartRef.current = chart;

    const emitStats = () => {
      onStatsRef.current?.(computeStats(chart.config.series[0].data));
    };
    emitStats();

    const timer = window.setInterval(() => {
      const t = Date.now();
      // NB: the payload must carry the series id — without it yagr would
      // add a brand-new series on every tick instead of appending points.
      chart.setSeries([t], [{id: SERIES_ID, data: [feed(t)]}], {incremental: true, splice: true});
      emitStats();
    }, SAMPLE_MS);

    return () => {
      window.clearInterval(timer);
      // Releases the ResizeObserver, uPlot instance, DOM and listeners.
      chart.dispose();
      chartRef.current = null;
    };
    // The chart is created once per mount; theme changes are applied
    // through the effect below via setTheme/setSeries.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setTheme(theme);
    chart.setSeries(SERIES_ID, {
      color: SERIES_FILL[theme],
      lineColor: SERIES_LINE[theme],
    } as Partial<RawSerieData>);
    chart.redraw(true, true);
  }, [theme]);

  return (
    <div
      ref={rootRef}
      className="cpu-chart"
      role="figure"
      aria-label="График загрузки CPU за последние сутки"
    />
  );
}
