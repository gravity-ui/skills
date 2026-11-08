import React, { useCallback, useEffect, useRef } from 'react';
import Yagr from '@gravity-ui/yagr';
import '@gravity-ui/yagr/index.css';
import type { YagrConfig } from '@gravity-ui/yagr';
import { useThemeType } from '@gravity-ui/uikit';

const POINTS_COUNT = 86_400;
const UPDATE_INTERVAL_MS = 1000;

function buildTimeline(now: number): number[] {
  const start = now - POINTS_COUNT * 1000;
  const arr = new Array<number>(POINTS_COUNT);
  for (let i = 0; i < POINTS_COUNT; i++) {
    arr[i] = start + i * 1000;
  }
  return arr;
}

function buildEmptyData(): (number | null)[] {
  return new Array(POINTS_COUNT).fill(null);
}

const CpuMonitor: React.FC = React.memo(function CpuMonitor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const yagrRef = useRef<Yagr | null>(null);
  const now = Date.now();
  const timelineRef = useRef<number[]>(buildTimeline(now));
  const cpuRef = useRef<(number | null)[]>(buildEmptyData());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const themeType = useThemeType();

  const init = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    yagrRef.current?.dispose();
    yagrRef.current = null;

    const cfg: Partial<YagrConfig> = {
      chart: {
        appearance: { theme: themeType === 'dark' ? 'dark' : 'light' },
      },
      timeline: timelineRef.current,
      axes: {
        x: { side: 'bottom' },
        y: { side: 'left', precision: 0, label: 'CPU, %' },
      },
      scales: {
        x: { time: true },
        y: { min: 0, max: 100, range: 'offset' },
      },
      series: [
        {
          id: 'cpu',
          name: 'CPU',
          scale: 'y',
          type: 'line',
          color: '#3B82F6',
          data: cpuRef.current,
        },
      ],
      cursor: { snapToValues: false },
      legend: { show: true },
      tooltip: { maxLines: 2, precision: 1 },
    };

    yagrRef.current = new Yagr(el, cfg as YagrConfig);
  }, [themeType]);

  // Chart lifecycle
  useEffect(() => {
    init();
  }, [init]);

  // Pull new data every second
  useEffect(() => {
    const onTick = () => {
      const y = yagrRef.current;
      if (!y) return;

      const t = Date.now();
      const val = Math.round((30 + Math.random() * 40 + Math.sin(t / 30_000) * 15) * 10) / 10;

      const tl = timelineRef.current;
      const dd = cpuRef.current;
      tl.push(t);
      dd.push(val);
      while (tl.length > POINTS_COUNT) {
        tl.shift();
        dd.shift();
      }

      y.setSeries(tl, [{ id: 'cpu', data: dd }], { incremental: false });
    };

    timerRef.current = setInterval(onTick, UPDATE_INTERVAL_MS);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // Resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => yagrRef.current?.reflow(true));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dispose
  useEffect(() => {
    return () => {
      yagrRef.current?.dispose();
      yagrRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', minHeight: 300 }}
    />
  );
});

export default CpuMonitor;
