import type {ChartDatasets, ChartPoint, ChartSeries} from './types';

/** Детерминированный генератор (mulberry32): демо одинаково выглядит при каждой загрузке. */
function createRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Продажи: 12 месяцев (декабрь 2025 — ноябрь 2026), три региона. */
function buildSales(): ChartDatasets['sales'] {
  const random = createRandom(42);
  const months = Array.from({length: 12}, (_, i) => Date.UTC(2025, 11 + i, 1));
  const regions = [
    {id: 'north', name: 'Север', base: 1800},
    {id: 'south', name: 'Юг', base: 2400},
    {id: 'east', name: 'Восток', base: 1200},
  ];

  const series: ChartSeries[] = regions.map((region) => ({
    id: region.id,
    name: region.name,
    points: months.map((x, i) => {
      const trend = 1 + 0.02 * i;
      const season = 1 + 0.12 * Math.sin((2 * Math.PI * i) / 12);
      const noise = 0.9 + 0.2 * random();
      return {x, y: Math.round(region.base * trend * season * noise)};
    }),
  }));

  return {series, unit: 'тыс. ₽'};
}

/** Мониторинг: сутки с шагом 10 с, 8640 точек на серию, три перцентиля латентности. */
function buildMonitoring(): ChartDatasets['monitoring'] {
  const random = createRandom(7);
  const STEP_MS = 10_000;
  const POINTS = (24 * 60 * 60 * 1000) / STEP_MS;
  const END = Date.UTC(2026, 10, 6, 0, 0);
  const START = END - POINTS * STEP_MS;
  const GAP_FROM = 5000;
  const GAP_TO = 5018; // около 3 минут пропуска

  const times = Array.from({length: POINTS}, (_, i) => START + i * STEP_MS);
  const p50: ChartPoint[] = [];
  const p95: ChartPoint[] = [];
  const p99: ChartPoint[] = [];

  times.forEach((x, i) => {
    const load = 1 + 0.35 * Math.sin((2 * Math.PI * i) / 900); // ритм около 2.5 часов
    const spike = random() < 0.002 ? 3 : 1;
    const median = (35 + 6 * random()) * load * spike;
    const gap = i >= GAP_FROM && i < GAP_TO;
    p50.push({x, y: Math.round(median)});
    p95.push({x, y: Math.round(median * (2.8 + 0.4 * random()))});
    p99.push({x, y: gap ? null : Math.round(median * (6 + 1.5 * random()))});
  });

  const series: ChartSeries[] = [
    {id: 'p50', name: 'p50', points: p50},
    {id: 'p95', name: 'p95', points: p95},
    {id: 'p99', name: 'p99', points: p99},
  ];

  return {series, unit: 'мс'};
}

export const DEMO_DATASETS: ChartDatasets = {
  sales: buildSales(),
  monitoring: buildMonitoring(),
};
