const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2026, 9, 1); // 1 Oct 2026

// Deterministic sample data (no Math.random) so the chart is stable between renders.
function makeSeries(base: number, amplitude: number, trend: number, phase: number) {
  return Array.from({ length: 30 }, (_, i) => ({
    x: START + i * DAY,
    y: Math.round((base + trend * i + amplitude * Math.sin(i / 3 + phase)) * 10) / 10,
  }));
}

export const visitsSeries = [
  { name: 'Desktop', points: makeSeries(42, 6, 0.35, 0) },
  { name: 'Mobile', points: makeSeries(30, 5, 0.6, 1.4) },
];
