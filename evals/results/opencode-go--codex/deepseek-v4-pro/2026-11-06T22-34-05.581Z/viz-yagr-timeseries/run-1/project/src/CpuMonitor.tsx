import {useThemeType} from '@gravity-ui/uikit';
import Yagr from '@gravity-ui/yagr';
import './yagr-base.css';

import {useEffect, useRef, useCallback} from 'react';

type YagrTheme = 'light' | 'dark' | 'light-hc' | 'dark-hc';

function generateTimeline(seconds: number, intervalMs: number): number[] {
  const now = Date.now();
  const start = now - seconds * 1000;
  const count = Math.floor((seconds * 1000) / intervalMs);
  return Array.from({length: count}, (_, i) => start + i * intervalMs);
}

function generateCpuData(timeline: number[]): number[] {
  const data: number[] = [];
  let current = 45 + Math.random() * 20;

  for (let i = 0; i < timeline.length; i++) {
    const drift = (Math.random() - 0.5) * 16;
    const seasonal = 10 * Math.sin((i / timeline.length) * Math.PI * 2 * 3);
    const noise = (Math.random() - 0.5) * 8;
    const spike = Math.random() < 0.005 ? 30 + Math.random() * 40 : 0;

    current = Math.max(0, Math.min(100, current + drift + seasonal * (1 / timeline.length) + noise * 0.1 + spike * 0.3));
    data.push(Math.round(current * 10) / 10);
  }

  return data;
}

const INTERVAL_MS = 2500;
const WINDOW_SECONDS = 24 * 60 * 60;

export function CpuMonitor() {
  const containerRef = useRef<HTMLDivElement>(null);
  const yagrRef = useRef<Yagr | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const gTheme = useThemeType();
  const yagrTheme: YagrTheme = gTheme === 'dark' ? 'dark' : 'light';

  const appendPoint = useCallback(() => {
    const y = yagrRef.current;
    if (!y || !y.uplot) return;

    const data = y.uplot.data;
    const series = data[1] as number[];

    const lastV = series.length > 0 ? (series[series.length - 1] as number) : 50;

    const drift = (Math.random() - 0.5) * 10;
    const spike = Math.random() < 0.008 ? 25 + Math.random() * 35 : 0;
    const newVal = Math.max(0, Math.min(100, lastV + drift + spike * 0.3));

    // Efficient append via uPlot batch — O(1) amortized, no full re-init
    y.batch(() => {
      y.setSeries(0, {
        data: series.concat(Math.round(newVal * 10) / 10),
      });
    });
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const timeline = generateTimeline(WINDOW_SECONDS, INTERVAL_MS);
    const cpuData = generateCpuData(timeline);

    const yagr = new Yagr(container, {
      timeline,
      series: [
        {
          id: 'cpu',
          name: 'CPU',
          data: cpuData,
          color: '#3B82F6',
          type: 'area',
        },
      ],
      chart: {
        appearance: {
          theme: yagrTheme,
        },
        size: {
          adaptive: true,
          resizeDebounceMs: 200,
        },
      },
      axes: {
        x: {
          label: 'Время',
          side: 'bottom',
        },
        y: {
          label: '%',
          scale: 'y',
          side: 'right',
          precision: 0,
        },
      },
      scales: {
        y: {
          min: 0,
          max: 100,
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        show: true,
        maxLines: 1,
        precision: 1,
        percent: true,
      },
    });

    yagrRef.current = yagr;

    timerRef.current = setInterval(() => {
      appendPoint();
    }, INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      yagrRef.current = null;
      yagr.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yagrTheme]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        minHeight: 300,
        flex: '1 1 auto',
      }}
    />
  );
}
