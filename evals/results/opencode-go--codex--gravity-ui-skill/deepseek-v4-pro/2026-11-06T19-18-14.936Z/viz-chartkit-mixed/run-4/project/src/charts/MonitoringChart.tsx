import React, {useCallback, useRef} from 'react';
import YagrChart, {type YagrReactRef} from '@gravity-ui/yagr/react';

const now = Date.now();
const ONE_MINUTE = 60_000;

function generateTimeline(n: number): number[] {
  return Array.from({length: n}, (_, i) => now - (n - 1 - i) * ONE_MINUTE);
}

function generateSeries(n: number, base: number, amplitude: number): number[] {
  return Array.from({length: n}, (_, i) =>
    base + Math.sin(i * 0.3) * amplitude + (Math.random() - 0.5) * amplitude * 0.4,
  );
}

const timeline = generateTimeline(100);
const cpuSeries = generateSeries(100, 45, 15);
const memSeries = generateSeries(100, 60, 10);

const config = {
  timeline,
  series: [
    {data: cpuSeries, name: 'CPU %', color: '#FF3B5C'},
    {data: memSeries, name: 'Memory %', color: '#3B7CFF'},
  ],
  axes: {
    y: {
      label: '%',
      scale: 'auto' as const,
      side: 'left' as const,
    },
  },
  chart: {
    series: {
      type: 'line' as const,
    },
  },
  legend: {show: true},
  cursor: {snapToValues: false as const},
  tooltip: {
    tracking: 'sticky' as const,
    maxLines: 10,
    highlight: true,
    sum: false,
    pinable: false,
    strategy: 'none' as const,
    showIndicies: false,
  },
};

interface MonitoringChartProps {
  height?: number;
}

export function MonitoringChart({height = 400}: MonitoringChartProps) {
  const yagrRef = useRef<YagrReactRef | null>(null);

  const onChartLoad = useCallback(() => {
    // Chart ready
  }, []);

  return (
    <div style={{height}}>
      <YagrChart
        id="monitoring-chart"
        config={config}
        ref={yagrRef}
        onChartLoad={onChartLoad}
      />
    </div>
  );
}
