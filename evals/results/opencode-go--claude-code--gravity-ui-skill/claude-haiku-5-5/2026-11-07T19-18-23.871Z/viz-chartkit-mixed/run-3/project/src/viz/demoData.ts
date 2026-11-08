import type {VizDataset} from './types';

const DAY_MS = 86_400_000;
const SALES_START = Date.UTC(2026, 0, 1);
const MONITORING_START = Date.UTC(2026, 10, 6, 0, 0, 0);
const MONITORING_STEP_MS = 1_000;

/** Детерминированный PRNG (mulberry32): демо-данные одинаковы при каждом запуске. */
function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Дневные продажи за год: тренд, годовая сезонность, провалы в выходные и шум. */
export function createSalesDataset(days = 365): VizDataset {
  const rng = createRng(42);
  const timestamps: number[] = [];
  const values: number[] = [];

  for (let i = 0; i < days; i++) {
    const timestamp = SALES_START + i * DAY_MS;
    const weekday = new Date(timestamp).getUTCDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.82 : 1;
    const seasonal = 1 + 0.15 * Math.sin((2 * Math.PI * i) / 365);
    const trend = 1 + (0.25 * i) / days;
    const noise = 0.92 + rng() * 0.16;

    timestamps.push(timestamp);
    values.push(Math.round(100_000 * weekend * seasonal * trend * noise));
  }

  return {timestamps, series: [{id: 'sales', name: 'Продажи, ₽', values}]};
}

/** Плотный ряд задержек API с шагом 1 с: медиана, p95 и p99 с редкими всплесками. */
export function createMonitoringDataset(count = 20_000): VizDataset {
  const rng = createRng(7);
  const timestamps: number[] = [];
  const p50: number[] = [];
  const p95: number[] = [];
  const p99: number[] = [];

  let load = 40;
  for (let i = 0; i < count; i++) {
    load = Math.min(60, Math.max(20, load + (rng() - 0.5) * 2));
    const spike = rng() < 0.002 ? 80 + rng() * 120 : 0;
    const median = load + spike * 0.3;
    const tail95 = median * (1.8 + rng() * 0.2) + spike;
    const tail99 = tail95 * (1.4 + rng() * 0.2);

    timestamps.push(MONITORING_START + i * MONITORING_STEP_MS);
    p50.push(Math.round(median));
    p95.push(Math.round(tail95));
    p99.push(Math.round(tail99));
  }

  return {
    timestamps,
    series: [
      {id: 'p50', name: 'p50, мс', values: p50},
      {id: 'p95', name: 'p95, мс', values: p95},
      {id: 'p99', name: 'p99, мс', values: p99},
    ],
  };
}
