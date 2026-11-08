// Deterministic mock data for the dashboard. Replace `buildHistory` with a real
// data source; everything downstream works on the DayRow shape.

export type RangeDays = 7 | 30 | 90;

export const CHANNELS = ['Сайт', 'Приложение', 'Маркетплейс'] as const;

export interface DayRow {
  date: Date;
  sessions: number;
  orders: number[]; // one entry per CHANNELS index
  revenue: number;
}

export interface Totals {
  sessions: number;
  orders: number;
  revenue: number;
}

const HISTORY_DAYS = 180; // enough for the 90-day range plus a 90-day comparison
const AVG_CHECK_BASE = 2100;

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHistory(): DayRow[] {
  const rand = mulberry32(20261106);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const channelBase = [118, 86, 58];
  const rows: DayRow[] = [];
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (HISTORY_DAYS - 1 - i));
    const weekly = 1 + 0.12 * Math.sin((2 * Math.PI * i) / 7);
    const growth = 1 + 0.0015 * i;
    const sessions = Math.round(21000 * weekly * growth * (0.92 + 0.16 * rand()));
    const orders = channelBase.map((b) => Math.round(b * weekly * growth * (0.85 + 0.3 * rand())));
    const avgCheck = AVG_CHECK_BASE * (0.94 + 0.12 * rand());
    const revenue = Math.round(orders.reduce((a, b) => a + b, 0) * avgCheck);
    rows.push({ date, sessions, orders, revenue });
  }
  return rows;
}

const HISTORY = buildHistory();

export function sliceRange(range: RangeDays): { current: DayRow[]; previous: DayRow[] } {
  return {
    current: HISTORY.slice(-range),
    previous: HISTORY.slice(-2 * range, -range),
  };
}

export function totals(rows: DayRow[]): Totals {
  let sessions = 0;
  let orders = 0;
  let revenue = 0;
  for (const r of rows) {
    sessions += r.sessions;
    orders += r.orders.reduce((a, b) => a + b, 0);
    revenue += r.revenue;
  }
  return { sessions, orders, revenue };
}

export type MetricId = 'revenue' | 'orders' | 'conversion' | 'avgCheck';

export function metricOf(id: MetricId, t: Totals): number {
  switch (id) {
    case 'revenue':
      return t.revenue;
    case 'orders':
      return t.orders;
    case 'conversion':
      return t.sessions > 0 ? t.orders / t.sessions : 0;
    case 'avgCheck':
      return t.orders > 0 ? t.revenue / t.orders : 0;
  }
}

/** Splits rows into `points` consecutive buckets and evaluates the metric on each. */
export function sparkline(id: MetricId, rows: DayRow[], points = 12): number[] {
  const n = rows.length;
  const buckets = Math.min(points, n);
  const out: number[] = [];
  for (let k = 0; k < buckets; k++) {
    const from = Math.floor((k * n) / buckets);
    const to = Math.floor(((k + 1) * n) / buckets);
    out.push(metricOf(id, totals(rows.slice(from, to))));
  }
  return out;
}

// Shares are deterministic per range so switching ranges shifts them a little.
function jitteredShares(weights: number[], seed: number): number[] {
  const rand = mulberry32(seed);
  const raw = weights.map((w) => w * (0.9 + 0.2 * rand()));
  const total = raw.reduce((a, b) => a + b, 0);
  return raw.map((v) => v / total);
}

export const SOURCE_NAMES = ['Органика', 'Платный', 'Соцсети', 'Email'] as const;
export const REGION_NAMES = ['Москва', 'Санкт-Петербург', 'Татарстан', 'Свердловская', 'Новосибирская', 'Прочие'] as const;

export function trafficSources(range: RangeDays, t: Totals) {
  const shares = jitteredShares([0.38, 0.27, 0.19, 0.16], range * 11 + 3);
  return SOURCE_NAMES.map((name, idx) => ({
    name,
    share: shares[idx],
    value: Math.round(t.sessions * shares[idx]),
  }));
}

export function regionRevenue(range: RangeDays, t: Totals) {
  // The last entry ("Прочие") is always rendered last. Its weight stays below
  // the top region even with the ±10% jitter, so the ranking reads correctly.
  const shares = jitteredShares([0.32, 0.15, 0.1, 0.09, 0.08, 0.26], range * 13 + 5);
  return REGION_NAMES.map((name, idx) => ({
    name,
    share: shares[idx],
    value: Math.round(t.revenue * shares[idx]),
  }));
}
