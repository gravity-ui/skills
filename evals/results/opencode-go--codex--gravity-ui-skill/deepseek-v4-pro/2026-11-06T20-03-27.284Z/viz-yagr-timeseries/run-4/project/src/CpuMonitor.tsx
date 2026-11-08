import React, {useEffect, useRef} from 'react';
import Yagr from '@gravity-ui/yagr';
import type {YagrTheme} from '@gravity-ui/yagr';
import {useThemeValue, Box, Text} from '@gravity-ui/uikit';

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const POINT_COUNT = 30_000;
const UPDATE_INTERVAL_MS = 2_000;

function generateWindow(windowMs: number, count: number) {
  const now = Date.now();
  const step = windowMs / (count - 1);
  const timeline: number[] = [];
  const data: (number | null)[] = [];
  for (let i = 0; i < count; i++) {
    timeline.push(now - windowMs + i * step);
    data.push(sampleAt(timeline[i]));
  }
  return {timeline, data};
}

function sampleAt(timestamp: number): number {
  const t = timestamp / 1000;
  return Math.max(0, Math.min(100,
    40 + 25 * Math.sin(t / 12) + 5 * Math.cos(t / 5) + (Math.random() - 0.5) * 20
  ));
}

function cpuSample(): number {
  return sampleAt(Date.now());
}

export function CpuMonitor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const yagrRef = useRef<Yagr | null>(null);
  const themeValue = useThemeValue();
  const yagrTheme: YagrTheme = themeValue === 'dark' ? 'dark' : 'light';

  // Mount / unmount: create Yagr instance and push simulated real-time data
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const {timeline, data} = generateWindow(DAY_MS, POINT_COUNT);

    const yagr = new Yagr(container, {
      timeline,
      series: [{data, id: 'cpu', name: 'CPU', type: 'area'}],
      chart: {appearance: {theme: yagrTheme}},
      scales: {
        x: {time: true},
        y: {min: 0, max: 100},
      },
      legend: {show: false},
      cursor: {},
    });

    yagrRef.current = yagr;

    const interval = setInterval(() => {
      const y = yagrRef.current;
      if (!y) return;
      const alignedData = y.uplot.data as (number | null)[][];
      const tData = alignedData[0] as number[];
      const yData = alignedData[1] as (number | null)[];
      const now = Date.now();

      y.setSeries(
        [...tData.slice(1), now],
        [{id: 'cpu', data: [...yData.slice(1), cpuSample()]}],
        {},
      );
    }, UPDATE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
      yagr.dispose();
      yagrRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync theme without re-creating the chart
  useEffect(() => {
    yagrRef.current?.setTheme(yagrTheme);
  }, [yagrTheme]);

  return (
    <Box spacing={{p: 4}}>
      <Text variant="header-1">Мониторинг CPU</Text>
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: 420,
          marginTop: 'var(--g-spacing-4)',
        }}
      />
    </Box>
  );
}
