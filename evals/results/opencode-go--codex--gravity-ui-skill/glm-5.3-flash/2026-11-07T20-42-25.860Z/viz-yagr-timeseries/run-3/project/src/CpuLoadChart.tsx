import React, {useCallback, useEffect, useId, useMemo, useRef} from 'react';

import {Box, Flex, Text, useThemeType} from '@gravity-ui/uikit';
import YagrComponent from '@gravity-ui/yagr/react';
import type Yagr from '@gravity-ui/yagr';

import styles from './CpuLoadChart.module.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const POINT_INTERVAL_MS = 1000;
const MAX_POINTS = DAY_MS / POINT_INTERVAL_MS;
const UPDATE_BATCH_SIZE = 5;

interface CpuLoadPoint {
  timestamp: number;
  value: number;
}

interface CpuLoadChartProps {
  className?: string;
}

function createInitialBuffer() {
  const currentTimestamp = Date.now();
  const startTimestamp = currentTimestamp - DAY_MS;
  const points: CpuLoadPoint[] = Array.from({length: MAX_POINTS}, (_, index) => {
    const timestamp = startTimestamp + index * POINT_INTERVAL_MS;
    const wave = Math.sin(index / 900) * 12 + Math.sin(timestamp / 300000) * 7;
    const value = 26 + wave + Math.random() * 4;

    return {
      timestamp,
      value: Math.round(value * 100) / 100,
    };
  });

  return {
    points,
    theme: 'light' as 'light' | 'dark',
  };
}

export function CpuLoadChart({className}: CpuLoadChartProps) {
  const reactId = useId();
  const chartId = `cpu-load-${reactId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const theme = useThemeType() as 'light' | 'dark';
  const bufferRef = useRef(createInitialBuffer());
  const pendingPoints = useRef<CpuLoadPoint[]>([]);
  const chartRef = useRef<Yagr | null>(null);

  const config = useMemo(() => {
    return {
      timeline: bufferRef.current.points.map((point) => point.timestamp),
      chart: {
        series: {type: 'line' as const},
        appearance: {
          theme: bufferRef.current.theme,
        },
        size: {
          adaptive: true,
          resizeDebounceMs: 100,
        },
      },
      legend: {
        show: false,
      },
      scales: {
        percent: {
          min: 0,
          max: 100,
        },
      },
      series: [
        {
          id: 'cpu',
          name: 'CPU',
          color: 'var(--g-color-base-info)',
          data: bufferRef.current.points.map((point) => point.value),
          scale: 'percent',
        },
      ],
      axes: {
        x: {},
        percent: {
          scale: 'percent',
          precision: 0,
          values: (_self: unknown, ticks: number[]) => ticks.map((tick) => `${tick}%`),
        },
      },
    };
  }, []);

  const applyPendingPoints = useCallback(() => {
    const chart = chartRef.current;
    const pending = pendingPoints.current;

    if (pending.length === 0 || !chart) {
      return;
    }

    const oldestAllowedTimestamp = Date.now() - DAY_MS;
    const firstRetainedIndex = bufferRef.current.points.findIndex(
      (point) => point.timestamp >= oldestAllowedTimestamp,
    );
    const removedCount = firstRetainedIndex === -1 ? 0 : firstRetainedIndex;
    const nextPoints = [
      ...bufferRef.current.points.slice(removedCount),
      ...pending,
    ];

    bufferRef.current.points = nextPoints;
    chart.setSeries(
      pending.map((point) => point.timestamp),
      [{id: 'cpu', data: pending.map((point) => point.value)}],
      {incremental: true, splice: false},
    );

    pendingPoints.current = [];
  }, []);

  const handleChartInit = useCallback((chart: Yagr) => {
    chartRef.current = chart;
    chart.setTheme(bufferRef.current.theme);
  }, []);

  useEffect(() => {
    const producerIntervalId = window.setInterval(() => {
      const lastPendingPoint = pendingPoints.current.at(-1);
      const lastPoint = lastPendingPoint ?? bufferRef.current.points.at(-1) ?? null;
      const timestamp = (lastPoint?.timestamp ?? Date.now()) + POINT_INTERVAL_MS;
      const previousValue = lastPoint?.value ?? 20;
      const wave = Math.sin(timestamp / 300000) * 7;
      const value = previousValue + wave * 0.08 + (Math.random() - 0.45) * 3;

      pendingPoints.current.push({
        timestamp,
        value: Math.round(Math.min(96, Math.max(2, value)) * 100) / 100,
      });

      if (pendingPoints.current.length >= UPDATE_BATCH_SIZE) {
        applyPendingPoints();
      }
    }, POINT_INTERVAL_MS);

    return () => {
      window.clearInterval(producerIntervalId);
      applyPendingPoints();
    };
  }, [applyPendingPoints]);

  useEffect(() => {
    bufferRef.current.theme = theme === 'dark' ? 'dark' : 'light';
    chartRef.current?.setTheme(theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  useEffect(() => {
    return () => {
      chartRef.current?.dispose();
      chartRef.current = null;
      pendingPoints.current = [];
    };
  }, []);

  return (
    <Box className={className} spacing={{p: 4}}>
      <Text variant="header-2">Мониторинг</Text>
      <Flex gap={3} direction="column">
        <Text color="secondary">Загрузка CPU за последние сутки</Text>
        <Box className={styles.chartContainer}>
          <YagrComponent
            id={chartId}
            className={styles.chart}
            config={config}
            onChartInited={handleChartInit}
          />
        </Box>
      </Flex>
    </Box>
  );
}
