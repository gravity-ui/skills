// Deterministic mock data for the dashboard. Shaped like a real API response so
// the widgets never reach into generation details.

export type PeriodId = '7d' | '30d' | '90d';

export interface Period {
  id: PeriodId;
  label: string;
  days: number;
}

export const PERIODS: Period[] = [
  { id: '7d', label: '7 дней', days: 7 },
  { id: '30d', label: '30 дней', days: 30 },
  { id: '90d', label: '90 дней', days: 90 },
];

export interface DailyPoint {
  date: Date;
  visits: number;
  orders: number;
  revenue: number;
}

export interface Share {
  name: string;
  value: number;
}

export interface ProductRow {
  name: string;
  orders: number;
  revenue: number;
}

export interface DashboardData {
  current: DailyPoint[];
  previous: DailyPoint[];
  channels: Share[]; // visits by acquisition channel, largest first
  devices: Share[]; // visits by device, sums to the same total as channels
  plan: { target: number; actual: number };
  products: ProductRow[];
}

export interface Totals {
  visits: number;
  orders: number;
  revenue: number;
}

export function totals(points: DailyPoint[]): Totals {
  return points.reduce(
    (acc, p) => ({
      visits: acc.visits + p.visits,
      orders: acc.orders + p.orders,
      revenue: acc.revenue + p.revenue,
    }),
    { visits: 0, orders: 0, revenue: 0 },
  );
}

/** Splits points into equal-ish buckets and sums each: used for sparklines. */
export function bucketSums(points: DailyPoint[], buckets: number, pick: (p: DailyPoint) => number): number[] {
  const out = Array.from({ length: buckets }, () => 0);
  points.forEach((p, i) => {
    const b = Math.min(buckets - 1, Math.floor((i * buckets) / points.length));
    out[b] += pick(p);
  });
  return out;
}

// Small seeded PRNG (mulberry32) so the same period always renders the same data.
function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildPeriod(
  days: number,
  seed: number,
  endDate: Date,
  baseVisits: number,
  growth: number,
  conversion: number,
): DailyPoint[] {
  const rand = rng(seed);
  return Array.from({ length: days }, (_, i) => {
    const weekly = 1 + 0.12 * Math.sin((2 * Math.PI * (i % 7)) / 7);
    const trend = 1 + growth * (i / Math.max(1, days - 1));
    const visits = Math.round(baseVisits * weekly * trend * (0.92 + rand() * 0.16));
    const orders = Math.round(visits * conversion * (0.85 + rand() * 0.3));
    const revenue = Math.round(orders * (3000 + rand() * 500));
    const date = new Date(endDate);
    date.setDate(endDate.getDate() - (days - 1 - i));
    return { date, visits, orders, revenue };
  });
}

const CHANNELS: [string, number][] = [
  ['Органический поиск', 0.34],
  ['Прямые заходы', 0.22],
  ['Соцсети', 0.16],
  ['Реклама', 0.14],
  ['Email', 0.08],
  ['Партнёры', 0.06],
];

const DEVICES: [string, number][] = [
  ['Десктоп', 0.46],
  ['Мобильные', 0.39],
  ['Планшеты', 0.09],
  ['Прочее', 0.06],
];

// Share of orders and of revenue per product; each column sums to 1.
const PRODUCTS: { name: string; orderShare: number; revenueShare: number }[] = [
  { name: 'Кофемашина Aroma', orderShare: 0.31, revenueShare: 0.34 },
  { name: 'Миксер Pulse', orderShare: 0.24, revenueShare: 0.21 },
  { name: 'Чайник Nord', orderShare: 0.19, revenueShare: 0.18 },
  { name: 'Блендер Atlas', orderShare: 0.14, revenueShare: 0.15 },
  { name: 'Тостер Ember', orderShare: 0.12, revenueShare: 0.12 },
];

const DAILY_PLAN_RUB = 1_450_000;

export function buildDashboardData(days: number, now: Date = new Date()): DashboardData {
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const current = buildPeriod(days, 1000 + days, end, 12000, 0.15, 0.028);
  const previous = buildPeriod(days, 2000 + days, end, 11000, 0.05, 0.026);

  const cur = totals(current);

  return {
    current,
    previous,
    channels: CHANNELS.map(([name, share]) => ({ name, value: Math.round(cur.visits * share) })),
    devices: DEVICES.map(([name, share]) => ({ name, value: Math.round(cur.visits * share) })),
    plan: { target: days * DAILY_PLAN_RUB, actual: cur.revenue },
    products: PRODUCTS.map((p) => ({
      name: p.name,
      orders: Math.round(cur.orders * p.orderShare),
      revenue: Math.round(cur.revenue * p.revenueShare),
    })),
  };
}
