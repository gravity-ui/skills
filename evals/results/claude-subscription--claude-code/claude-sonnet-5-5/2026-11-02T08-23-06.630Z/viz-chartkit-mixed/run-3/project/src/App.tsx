import {ChartWidget} from './chart-widget';
import type {ChartDataset} from './chart-widget';

const DAY = 24 * 3600 * 1000;
const START = Date.UTC(2026, 9, 1);

// Deterministic pseudo-noise so the demo looks the same on every load.
const noise = (i: number, seed: number) => Math.sin(i * 12.9898 + seed * 78.233) * 0.5 + 0.5;

const sales: ChartDataset = {
  unit: 'тыс. ₽',
  series: [
    {
      id: 'online',
      name: 'Онлайн',
      points: Array.from({length: 30}, (_, i) => [
        START + i * DAY,
        Math.round(120 + i * 2.5 + noise(i, 1) * 40),
      ]),
    },
    {
      id: 'retail',
      name: 'Розница',
      points: Array.from({length: 30}, (_, i) => [
        START + i * DAY,
        Math.round(90 + (i % 7 > 4 ? 35 : 0) + noise(i, 2) * 25),
      ]),
    },
  ],
};

// 3 hours of latency at 10-second resolution, 3 services.
const POINTS = 3 * 360;
const STEP = 10_000;
const NOW = Date.UTC(2026, 10, 2, 9, 0, 0);
const monitoring: ChartDataset = {
  unit: 'мс',
  series: ['api', 'auth', 'search'].map((name, s) => ({
    id: name,
    name,
    points: Array.from({length: POINTS}, (_, i) => {
      const spike = i % 540 > 520 ? 60 : 0;
      return [
        NOW - (POINTS - i) * STEP,
        Math.round(40 + s * 25 + noise(i, s + 3) * 20 + spike),
      ] as const;
    }),
  })),
};

export function App() {
  return (
    <div style={{padding: 24, maxWidth: 960}}>
      <ChartWidget
        title="Показатели"
        datasets={{sales, monitoring}}
        defaultMode="sales"
      />
    </div>
  );
}
