import type {ChartWidgetData} from './chart-widget';

// Deterministic PRNG so the demo looks the same on every reload.
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32;
    return state / 2 ** 32;
  };
}

function buildSales(random: () => number): ChartWidgetData['sales'] {
  const months = Array.from({length: 24}, (_, i) => Date.UTC(2024, 10 + i, 1));
  const channel = (name: string, base: number, growth: number) => ({
    name,
    points: months.map((timestamp, i) => {
      const seasonality = 1 + 0.18 * Math.sin(((i + 2) / 12) * 2 * Math.PI);
      const noise = 0.92 + random() * 0.16;
      return {timestamp, value: Math.round(base * (1 + growth * i) * seasonality * noise)};
    }),
  });

  return {
    series: [channel('Онлайн', 4_200_000, 0.035), channel('Розница', 6_100_000, 0.008)],
    valueSuffix: ' ₽',
  };
}

function buildMonitoring(random: () => number): ChartWidgetData['monitoring'] {
  const stepMs = 10_000;
  const pointCount = (24 * 60 * 60 * 1000) / stepMs; // 24h at 10s resolution = 8640 points
  const end = Date.UTC(2026, 9, 28, 9, 0);
  const timeline = Array.from({length: pointCount}, (_, i) => end - (pointCount - 1 - i) * stepMs);

  const p50: (number | null)[] = [];
  const p95: (number | null)[] = [];
  const p99: (number | null)[] = [];
  timeline.forEach((timestamp, i) => {
    // Missing scrape: a short gap the chart should show, not interpolate over.
    if (i >= 5200 && i < 5230) {
      p50.push(null);
      p95.push(null);
      p99.push(null);
      return;
    }
    const hour = ((timestamp / 3_600_000) % 24) + 3; // smooth daily load curve, MSK
    const load = 1 + 0.5 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
    const incident = i >= 6100 && i < 6250 ? 2.6 : 1;
    const base = 38 * load * incident;
    p50.push(+(base * (0.9 + random() * 0.2)).toFixed(1));
    p95.push(+(base * 2.1 * (0.85 + random() * 0.3)).toFixed(1));
    p99.push(+(base * 3.4 * (0.8 + random() * 0.45 + (random() > 0.995 ? 0.8 : 0))).toFixed(1));
  });

  return {
    timeline,
    series: [
      {name: 'p50', values: p50},
      {name: 'p95', values: p95},
      {name: 'p99', values: p99},
    ],
    unit: 'мс',
    timeZone: 'Europe/Moscow',
  };
}

export function createDemoData(): ChartWidgetData {
  const random = createRandom(42);
  return {sales: buildSales(random), monitoring: buildMonitoring(random)};
}
