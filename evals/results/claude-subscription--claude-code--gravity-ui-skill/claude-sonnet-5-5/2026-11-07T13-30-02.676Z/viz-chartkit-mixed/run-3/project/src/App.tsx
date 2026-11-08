import React from 'react';

import {ChartWidget} from './ChartWidget';
import type {MonitoringData, SalesData} from './ChartWidget';

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
const END = Date.UTC(2026, 10, 1);

function makeSales(): SalesData {
  return {
    name: 'Выручка, ₽',
    points: Array.from({length: 12}, (_, i) => ({
      timestamp: Date.UTC(2026, i, 1),
      value: Math.round(900_000 + i * 60_000 + Math.sin(i / 1.5) * 120_000),
    })),
  };
}

function makeMonitoring(): MonitoringData {
  const length = 2000;
  const start = END - length * 60_000;
  const timeline = Array.from({length}, (_, i) => start + i * 60_000);
  return {
    timeline,
    series: [
      {
        id: 'cpu',
        name: 'CPU, %',
        values: timeline.map((_, i) => 40 + Math.sin(i / 40) * 20 + Math.sin(i / 3) * 5),
      },
      {
        id: 'rps',
        name: 'Запросов в секунду',
        // a gap in the middle is a normal case for monitoring data
        values: timeline.map((_, i) =>
          i > 900 && i < 960 ? null : 120 + Math.cos(i / 55) * 50 + Math.sin(i / 5) * 10,
        ),
      },
    ],
  };
}

export function App() {
  const sales = React.useMemo(makeSales, []);
  const monitoring = React.useMemo(makeMonitoring, []);

  return (
    <div style={{padding: 24, maxWidth: 960, boxSizing: 'border-box'}}>
      <ChartWidget title="Аналитика" sales={sales} monitoring={monitoring} />
    </div>
  );
}
