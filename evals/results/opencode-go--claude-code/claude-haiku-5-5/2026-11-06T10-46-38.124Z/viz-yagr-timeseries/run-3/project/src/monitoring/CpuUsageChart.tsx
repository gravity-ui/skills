import {useEffect, useRef} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {AreaSeriesOptions, MinimalValidConfig, RawSerieData} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {useThemeType} from '@gravity-ui/uikit';

import type {CpuFeed} from './cpuFeed';
import './CpuUsageChart.css';

const SERIES_ID = 'cpu';

/** Categorical slot 1 (blue) from the dataviz palette, stepped per theme. */
const LINE_COLOR = {light: '#2a78d6', dark: '#3987e5'} as const;

function withAlpha(hex: string, alpha: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function createConfig(feed: CpuFeed, theme: 'light' | 'dark'): MinimalValidConfig {
  const line = LINE_COLOR[theme];
  const series: RawSerieData<AreaSeriesOptions> = {
    id: SERIES_ID,
    name: 'Загрузка CPU',
    type: 'area',
    data: feed.values.slice(),
    color: withAlpha(line, 0.14),
    lineColor: line,
    lineWidth: 2,
  };
  return {
    // Yagr mutates the arrays it receives on incremental updates, so it must get
    // copies. Handing it the feed's own arrays would apply every update twice.
    timeline: feed.timeline.slice(),
    series: [series],
    chart: {
      appearance: {theme, locale: 'ru'},
      size: {adaptive: true},
    },
    legend: {show: false},
    scales: {y: {min: 0, max: 100}},
    axes: {
      y: {
        precision: 0,
        values: (_u, ticks) => ticks.map((t) => `${t}%`),
      },
    },
    tooltip: {
      strategy: 'none',
      // Keep the tooltip in place on each data update instead of hiding it every tick.
      onUpdate: 'none',
      value: (v) => (v == null ? '—' : `${Number(v).toFixed(1)}%`),
    },
  };
}

interface CpuUsageChartProps {
  feed: CpuFeed;
}

/**
 * 24h CPU load chart. Fills its parent (the parent must have a definite size).
 *
 * The Yagr instance is recreated when the theme changes and disposed on unmount.
 * Between those points, each feed tick is applied as an incremental update (append
 * the new point, drop the oldest) without rebuilding the 43k-point dataset.
 */
export function CpuUsageChart({feed}: CpuUsageChartProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const theme = useThemeType();

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const chart = new Yagr(host, createConfig(feed, theme));
    const unsubscribe = feed.subscribe((t, v) => {
      chart.setSeries([t], [{id: SERIES_ID, data: [v]}], {incremental: true, splice: true});
    });

    return () => {
      unsubscribe();
      chart.dispose();
    };
  }, [feed, theme]);

  return (
    <div className="cpu-chart">
      <div
        ref={hostRef}
        className="cpu-chart__plot"
        role="img"
        aria-label="График загрузки CPU за последние 24 часа"
      />
    </div>
  );
}
