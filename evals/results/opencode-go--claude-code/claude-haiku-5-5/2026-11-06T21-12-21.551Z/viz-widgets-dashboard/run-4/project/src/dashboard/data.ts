// Deterministic mock sales data. The same seed gives the same numbers on every load.

/** Categorical order is fixed: a channel keeps its color (series-1..3) in every view. */
export const CHANNELS = [
  { id: 'online', name: 'Онлайн', base: 170_000 },
  { id: 'retail', name: 'Розница', base: 240_000 },
  { id: 'partners', name: 'Партнёры', base: 110_000 },
] as const;

/** Shares are fixed and sum to 1; regions are ranked by value in `buildPeriod`. */
const REGION_SHARES = [
  { name: 'Москва', share: 0.33 },
  { name: 'Санкт-Петербург', share: 0.21 },
  { name: 'Татарстан', share: 0.14 },
  { name: 'Краснодарский край', share: 0.12 },
  { name: 'Свердловская область', share: 0.11 },
  { name: 'Новосибирская область', share: 0.09 },
] as const;

const HISTORY_DAYS = 180;
/** The last day of data. A fixed date keeps the mock stable across loads. */
const END = new Date(2026, 10, 5);

export interface Day {
  date: Date;
  /** Revenue per channel, index-aligned with CHANNELS. */
  channels: number[];
  revenue: number;
  orders: number;
}

export type MetricKey = 'revenue' | 'orders' | 'avgCheck';

export interface Totals {
  revenue: number;
  orders: number;
  avgCheck: number;
}

export interface PeriodData {
  /** Days in the current period, oldest first. */
  days: Day[];
  totals: Totals;
  /** The same number of days immediately before the current period. */
  previous: Totals;
  /** Up to 12 buckets across the period, for sparklines. */
  spark: Record<MetricKey, number[]>;
  regions: { name: string; value: number; share: number }[];
}

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(count: number): Day[] {
  const rand = rng(20261105);
  const days: Day[] = [];
  for (let ago = count - 1; ago >= 0; ago--) {
    const date = new Date(END);
    date.setDate(END.getDate() - ago);
    const weekend = date.getDay() === 0 || date.getDay() === 6;
    const season = 1 + 0.12 * Math.sin(ago / 14);
    const channels = CHANNELS.map((c) =>
      Math.round(c.base * season * (weekend ? 1.15 : 1) * (0.85 + 0.3 * rand())),
    );
    const revenue = channels.reduce((sum, v) => sum + v, 0);
    const avgCheck = 470 + 90 * rand();
    days.push({ date, channels, revenue, orders: Math.round(revenue / avgCheck) });
  }
  return days;
}

const HISTORY = buildHistory(HISTORY_DAYS);

function totalsOf(days: Day[]): Totals {
  const revenue = days.reduce((s, d) => s + d.revenue, 0);
  const orders = days.reduce((s, d) => s + d.orders, 0);
  return { revenue, orders, avgCheck: orders ? revenue / orders : 0 };
}

/** Build the dashboard data for the last `n` days, compared with the `n` days before them. */
export function buildPeriod(n: number): PeriodData {
  const days = HISTORY.slice(-n);
  const totals = totalsOf(days);

  const buckets = Math.min(12, n);
  const spark: PeriodData['spark'] = { revenue: [], orders: [], avgCheck: [] };
  for (let b = 0; b < buckets; b++) {
    const from = Math.floor((b * n) / buckets);
    const to = Math.max(from + 1, Math.floor(((b + 1) * n) / buckets));
    const t = totalsOf(days.slice(from, to));
    spark.revenue.push(t.revenue);
    spark.orders.push(t.orders);
    spark.avgCheck.push(t.avgCheck);
  }

  const regions = REGION_SHARES.map((r) => ({
    name: r.name,
    share: r.share,
    value: Math.round(totals.revenue * r.share),
  })).sort((a, b) => b.value - a.value);

  return {
    days,
    totals,
    previous: totalsOf(HISTORY.slice(-2 * n, -n)),
    spark,
    regions,
  };
}
