import React from 'react';

import {ChartWidget} from './chart-widget';
import type {ChartWidgetData, ChartWidgetMode} from './chart-widget';

const DAY = 24 * 3600 * 1000;
const MINUTE = 60 * 1000;

function createDemoData(): ChartWidgetData {
  const now = Math.floor(Date.now() / MINUTE) * MINUTE;

  const salesStart = now - 29 * DAY;
  const sales = Array.from({length: 30}, (_, i) => ({
    x: salesStart + i * DAY,
    y: Math.round(1200 + i * 25 + Math.sin(i / 2) * 180 + ((i * 37) % 90)),
  }));

  // 3 hours of per-10-second samples: 1080 points per series.
  const count = 1080;
  const step = 10 * 1000;
  const start = now - count * step;
  const timeline = Array.from({length: count}, (_, i) => start + i * step);
  const wave = (i: number, period: number, amp: number, base: number) =>
    Math.round((base + Math.sin((i / period) * Math.PI * 2) * amp + ((i * 7919) % 13)) * 10) / 10;

  return {
    sales: [{id: 'revenue', name: 'Выручка, ₽ тыс.', points: sales}],
    monitoring: {
      timeline,
      series: [
        {id: 'cpu', name: 'CPU, %', values: timeline.map((_, i) => wave(i, 180, 20, 45))},
        {id: 'mem', name: 'Память, %', values: timeline.map((_, i) => wave(i, 420, 10, 60))},
        {id: 'rps', name: 'RPS', values: timeline.map((_, i) => wave(i, 90, 30, 110))},
      ],
    },
  };
}

export function App() {
  const data = React.useMemo(createDemoData, []);
  const [mode, setMode] = React.useState<ChartWidgetMode>('sales');

  return (
    <div style={{padding: 24, maxWidth: 960}}>
      <ChartWidget title="Метрики" data={data} mode={mode} onModeChange={setMode} />
    </div>
  );
}
