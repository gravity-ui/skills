import React, { useMemo } from 'react';
import { ChartWidget } from './ChartWidget';
import type { ChartDataPoint } from './types';

const NOW = Date.now();
const DAY = 86_400_000;
const HOUR = 3_600_000;

function makeSalesData(): ChartDataPoint[] {
  return Array.from({ length: 14 }, (_, i) => ({
    timestamp: NOW - (13 - i) * DAY,
    value: Math.round(120 + Math.random() * 80 + Math.sin(i * 0.6) * 30),
    label: `День ${i + 1}`,
  }));
}

function makeMonitoringData(): ChartDataPoint[] {
  return Array.from({ length: 60 }, (_, i) => ({
    timestamp: NOW - (59 - i) * HOUR,
    value: Math.round(50 + Math.random() * 40 + Math.sin(i * 0.4) * 15),
    label: `T${i}`,
  }));
}

export function App() {
  const salesData = useMemo(makeSalesData, []);
  const monitoringData = useMemo(makeMonitoringData, []);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 32 }}>
      <ChartWidget data={salesData} mode="sales" title="Продажи по дням" height={300} />
      <ChartWidget data={monitoringData} mode="monitoring" title="Загрузка CPU (мониторинг)" height={260} />
    </div>
  );
}
