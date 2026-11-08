import React from 'react';

import Yagr from '@gravity-ui/yagr';
import type {YagrTheme} from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import {useThemeType} from '@gravity-ui/uikit';

import {DAY_MS, STEP_MS, createInitialCpuBuffer, nextCpuPoint} from './cpuData';
import type {CpuBuffer} from './cpuData';
import './CpuChart.css';

const SERIES_ID = 'cpu';
/** Trim the window only when the buffer has outgrown it by this share (avoids a full re-process on every tick). */
const TRIM_SLACK = 0.02;

export interface CpuChartProps {
  className?: string;
}

function buildConfig(buffer: CpuBuffer, theme: YagrTheme) {
  return {
    chart: {
      size: {adaptive: true, resizeDebounceMs: 100},
      appearance: {theme, locale: 'ru' as const},
    },
    // Yagr mutates its config on incremental updates, so it must own its copies.
    timeline: [...buffer.timeline],
    series: [
      {
        id: SERIES_ID,
        name: 'CPU',
        type: 'line' as const,
        data: [...buffer.values],
        color: 'var(--g-color-base-brand)',
        width: 1.5,
        precision: 1,
        spanGaps: false,
      },
    ],
    axes: {
      y: {
        side: 'left' as const,
        values: (_u: unknown, splits: number[]) => splits.map((v) => `${v}%`),
      },
    },
    scales: {
      x: {},
      y: {min: 0, max: 100, range: 'nice' as const},
    },
    legend: {show: false},
    tooltip: {
      show: true,
      value: (value: string | number | null) => (value === null ? '—' : `${value}%`),
    },
  };
}

export function CpuChart({className}: CpuChartProps) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const yagrRef = React.useRef<Yagr | null>(null);
  const themeType = useThemeType();
  const yagrTheme: YagrTheme = themeType === 'dark' ? 'dark' : 'light';
  const themeRef = React.useRef(yagrTheme);
  themeRef.current = yagrTheme;

  // Create the chart once, drive realtime updates, dispose everything on unmount.
  React.useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return undefined;
    }

    // Own buffer is the source of truth; Yagr only receives appended slices.
    let buffer = createInitialCpuBuffer();
    const yagr = new Yagr(root, buildConfig(buffer, themeRef.current));
    yagrRef.current = yagr;

    let pending: {t: number; v: number}[] = [];
    let rafId = 0;

    const flush = () => {
      rafId = 0;
      if (!pending.length || yagrRef.current !== yagr) {
        return;
      }
      const batch = pending;
      pending = [];
      const times = batch.map((p) => p.t);
      const vals = batch.map((p) => p.v);
      buffer.timeline.push(...times);
      buffer.values.push(...vals);

      const windowStart = times[times.length - 1] - DAY_MS;
      const maxLen = Math.floor(DAY_MS / STEP_MS) * (1 + TRIM_SLACK);
      if (buffer.timeline.length > maxLen) {
        // Rare full update: drop points that left the 24h window.
        let cut = 0;
        while (cut < buffer.timeline.length && buffer.timeline[cut] < windowStart) {
          cut++;
        }
        buffer = {timeline: buffer.timeline.slice(cut), values: buffer.values.slice(cut)};
        yagr.setSeries([...buffer.timeline], [{id: SERIES_ID, data: [...buffer.values]}], {
          incremental: false,
        });
      } else {
        // Cheap path: append only the new points.
        yagr.setSeries(times, [{id: SERIES_ID, data: vals}], {incremental: true});
      }
    };

    const timer = window.setInterval(() => {
      if (document.hidden) {
        return; // don't burn CPU rendering a hidden tab; catch up on next tick
      }
      const last = pending[pending.length - 1] ?? {
        t: buffer.timeline[buffer.timeline.length - 1],
        v: buffer.values[buffer.values.length - 1],
      };
      pending.push(nextCpuPoint(last));
      if (!rafId) {
        rafId = requestAnimationFrame(flush);
      }
    }, STEP_MS);

    return () => {
      window.clearInterval(timer);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      pending = [];
      yagrRef.current = null;
      yagr.dispose();
    };
  }, []);

  // Follow the Gravity UI theme without recreating the chart.
  React.useEffect(() => {
    yagrRef.current?.setTheme(yagrTheme);
  }, [yagrTheme]);

  return <div ref={rootRef} className={`cpu-chart${className ? ` ${className}` : ''}`} />;
}
