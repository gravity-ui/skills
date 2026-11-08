import React from 'react';
import YagrChart from '@gravity-ui/yagr/react';
import type {MinimalValidConfig} from '@gravity-ui/yagr';
import type {YagrReactRef} from '@gravity-ui/yagr/react';

export type CpuPoint = {
  timestamp: number;
  value: number;
};

type CpuUsageChartProps = {
  points: CpuPoint[];
  theme: 'light' | 'dark';
};

const POINT_COUNT = 43_200;
const POINT_INTERVAL_MS = 2_000;

function createConfig(
  theme: CpuUsageChartProps['theme'],
  points: CpuPoint[],
): MinimalValidConfig {
  return {
    timeline: points.map(({timestamp}) => timestamp),
    series: [
      {
        id: 'cpu',
        name: 'CPU',
        data: points.map(({value}) => value),
        color: 'var(--g-color-text-brand)',
        scale: 'y',
      },
    ],
    chart: {
      appearance: {theme},
      series: {
        type: 'line',
        width: 1.5,
        interpolation: 'linear',
      },
      size: {
        adaptive: true,
        resizeDebounceMs: 100,
      },
    },
    scales: {
      x: {},
      y: {min: 0, max: 100},
    },
    cursor: {},
    tooltip: {show: true},
  };
}

function createPoints(count: number, endTimestamp: number): CpuPoint[] {
  return Array.from({length: count}, (_, index) => {
    const timestamp = endTimestamp - (count - 1 - index) * POINT_INTERVAL_MS;
    const value = 30 + 25 * Math.sin((index / count) * Math.PI * 4) + Math.random() * 5;

    return {timestamp, value};
  });
}

function createNextPoint(points: CpuPoint[], timestamp: number): CpuPoint {
  const previousValue = points[points.length - 1].value;
  const value = Math.min(100, Math.max(0, previousValue + (Math.random() - 0.5) * 6));

  return {timestamp, value};
}

export function CpuUsageChart({theme}: CpuUsageChartProps) {
  const chartRef = React.useRef<YagrReactRef | null>(null);
  const pointsRef = React.useRef<CpuPoint[]>([]);
  const initialPoints = React.useMemo(() => createPoints(POINT_COUNT, Date.now()), []);
  const config = React.useMemo(
    () => createConfig(theme, initialPoints),
    [initialPoints, theme],
  );

  pointsRef.current = initialPoints;

  React.useEffect(() => {
    pointsRef.current = initialPoints;

    const interval = window.setInterval(() => {
      const chart = chartRef.current?.yagr();
      if (!chart) {
        return;
      }

      const newPoint = createNextPoint(pointsRef.current, Date.now());
      pointsRef.current = [...pointsRef.current.slice(1), newPoint];

      chart.setSeries(
        [newPoint.timestamp],
        [{id: 'cpu', data: [newPoint.value]}],
        {incremental: true, splice: true},
      );
    }, POINT_INTERVAL_MS);

    return () => {
      window.clearInterval(interval);
    };
  }, [initialPoints]);

  return (
    <YagrChart
      ref={chartRef}
      id="cpu-usage-chart"
      className="cpu-usage-chart__canvas"
      config={config}
      update="hard"
    />
  );
}
