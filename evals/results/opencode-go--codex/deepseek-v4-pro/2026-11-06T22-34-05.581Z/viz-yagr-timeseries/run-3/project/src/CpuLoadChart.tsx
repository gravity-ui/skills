import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import YagrReact, { type YagrReactRef } from '@gravity-ui/yagr/react';
import type { MinimalValidConfig, YagrTheme } from '@gravity-ui/yagr';
import { useThemeValue } from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const POINT_COUNT = 36000;
const UPDATE_INTERVAL_MS = 2000;

function generateInitialData(now: number): number[] {
  const start = now - MS_PER_DAY;
  const data: number[] = [];
  for (let i = 0; i < POINT_COUNT; i++) {
    data.push(start + (i / (POINT_COUNT - 1)) * MS_PER_DAY);
  }
  return data;
}

function generateCpuValues(
  timestamps: number[],
  seed: number,
): (number | null)[] {
  let rng = seed;
  const next = () => {
    rng = (rng * 16807 + 0) % 2147483647;
    return (rng - 1) / 2147483646;
  };
  return timestamps.map((ts, i) => {
    const hour = new Date(ts).getHours();
    const base = 30 + 15 * Math.sin(((hour - 6) * Math.PI) / 12);
    const noise = (next() - 0.5) * 16;
    if (i > 0 && next() < 0.001) return null;
    return Math.min(100, Math.max(0, base + noise));
  });
}

function toYagrTheme(theme: string): YagrTheme {
  if (theme === 'dark' || theme === 'dark-hc' || theme === 'light-hc') {
    return theme as YagrTheme;
  }
  return 'light';
}

export function CpuLoadChart() {
  const yagrRef = useRef<YagrReactRef | null>(null);
  const themeValue = useThemeValue();
  const yagrTheme = toYagrTheme(themeValue);

  const now = useMemo(() => Date.now(), []);
  const timestamps = useMemo(() => generateInitialData(now), [now]);
  const userSeries = useMemo(
    () => generateCpuValues(timestamps, 12345),
    [timestamps],
  );
  const systemSeries = useMemo(
    () => generateCpuValues(timestamps, 67890),
    [timestamps],
  );

  const config: MinimalValidConfig = useMemo(
    () => ({
      timeline: timestamps,
      series: [
        {
          id: 'user',
          name: 'User',
          type: 'line' as const,
          color: '#4da6ff',
          lineColor: '#4da6ff',
          data: userSeries,
          width: 1.5,
        },
        {
          id: 'system',
          name: 'System',
          type: 'line' as const,
          color: '#ff7043',
          lineColor: '#ff7043',
          data: systemSeries,
          width: 1.5,
        },
      ],
      chart: {
        appearance: {
          theme: yagrTheme,
        },
      },
      axes: {
        y: {
          label: 'CPU %',
        },
      },
      scales: {
        y: {},
      },
      cursor: {
        snapToValues: false,
      },
      legend: {
        show: true,
      },
    }),
    [timestamps, userSeries, systemSeries, yagrTheme],
  );

  useEffect(() => {
    const id = setInterval(() => {
      const chart = yagrRef.current?.yagr() as InstanceType<
        typeof Yagr
      > | undefined;
      if (!chart) return;
      const newTs = Date.now();
      const newUser =
        30 +
        15 * Math.sin(((new Date(newTs).getHours() - 6) * Math.PI) / 12) +
        (Math.random() - 0.5) * 16;
      const newSystem =
        10 +
        8 * Math.sin(((new Date(newTs).getHours() - 6) * Math.PI) / 12) +
        (Math.random() - 0.5) * 10;

      chart.setSeries(
        [newTs],
        [
          { id: 'user', data: [Math.min(100, Math.max(0, newUser))] },
          { id: 'system', data: [Math.min(100, Math.max(0, newSystem))] },
        ],
        { incremental: true },
      );
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(id);
  }, []);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minHeight: 350,
        position: 'relative',
      }}
    >
      <YagrReact
        ref={yagrRef}
        id="cpu-load-chart"
        config={config}
        className="cpu-load-chart"
      />
    </div>
  );
}
