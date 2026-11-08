/** Deterministic demo data for the dashboard (seeded, so reloads look the same). */

export type RangeKey = '7d' | '30d' | '90d';

export const RANGES: { value: RangeKey; content: string; days: number; previous: string }[] = [
  { value: '7d', content: '7 дней', days: 7, previous: 'к прошлой неделе' },
  { value: '30d', content: '30 дней', days: 30, previous: 'к прошлым 30 дням' },
  { value: '90d', content: '90 дней', days: 90, previous: 'к прошлым 90 дням' },
];

interface Day {
  date: Date;
  sessions: number;
  users: number;
  orders: number;
  revenue: number;
  categories: number[];
  sources: number[];
}

export const CATEGORIES = ['Электроника', 'Одежда', 'Дом и сад', 'Красота', 'Спорт', 'Книги'];
const CATEGORY_SHARE = [0.34, 0.22, 0.16, 0.12, 0.1, 0.06];

/** Order is the categorical slot order (slot 1…5) — colour follows the source, not its rank. */
export const SOURCES = ['Поиск', 'Прямые заходы', 'Соцсети', 'Реклама', 'Email'];
const SOURCE_SHARE = [0.41, 0.24, 0.15, 0.13, 0.07];

const HISTORY_DAYS = 180;

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function buildHistory(): Day[] {
  const rnd = mulberry32(20261105);
  const noise = (amp: number) => 1 + (rnd() * 2 - 1) * amp;
  const today = startOfDay(new Date());
  const days: Day[] = [];
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const t = HISTORY_DAYS - 1 - i;
    const weekday = date.getDay();
    const weekly = weekday === 0 || weekday === 6 ? 0.82 : 1.04;
    const trend = 1 + t * 0.0025;
    const sessions = Math.round(5200 * weekly * trend * noise(0.08));
    const users = Math.round(sessions * 0.71 * noise(0.03));
    const conversion = 0.026 * noise(0.12) * (weekly > 1 ? 1 : 1.08);
    const orders = Math.max(1, Math.round(sessions * conversion));
    const revenue = Math.round(orders * 3350 * noise(0.1));
    const categories = CATEGORY_SHARE.map((s) => revenue * s * noise(0.25));
    const sources = SOURCE_SHARE.map((s) => sessions * s * noise(0.2));
    days.push({ date, sessions, users, orders, revenue, categories, sources });
  }
  return days;
}

const HISTORY = buildHistory();

export interface Kpi {
  value: number;
  previous: number;
  /** 12 buckets across the current period, oldest first. */
  trend: number[];
}

export interface OrderRow {
  id: string;
  customer: string;
  amount: number;
  status: 'delivered' | 'shipping' | 'processing' | 'cancelled';
  date: Date;
}

export interface DashboardData {
  range: RangeKey;
  dates: Date[];
  sessions: number[];
  users: number[];
  kpi: { revenue: Kpi; orders: Kpi; conversion: Kpi; avgCheck: Kpi };
  categories: { name: string; value: number }[];
  sources: { name: string; value: number }[];
  plan: { target: number; actual: number };
  orders: OrderRow[];
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

function buckets(days: Day[], pick: (d: Day[]) => number, n = 12): number[] {
  if (days.length <= n) return days.map((d) => pick([d]));
  return Array.from({ length: n }, (_, i) => {
    const from = Math.floor((i * days.length) / n);
    const to = Math.floor(((i + 1) * days.length) / n);
    return pick(days.slice(from, to));
  });
}

const revenueOf = (d: Day[]) => sum(d.map((x) => x.revenue));
const ordersOf = (d: Day[]) => sum(d.map((x) => x.orders));
const conversionOf = (d: Day[]) => (ordersOf(d) / sum(d.map((x) => x.sessions))) * 100;
const avgCheckOf = (d: Day[]) => revenueOf(d) / ordersOf(d);

function kpi(cur: Day[], prev: Day[], pick: (d: Day[]) => number): Kpi {
  return { value: pick(cur), previous: pick(prev), trend: buckets(cur, pick) };
}

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Кузнецова',
  'Дмитрий Волков',
  'Елена Соколова',
  'Алексей Морозов',
  'Ольга Новикова',
  'Сергей Лебедев',
  'Наталья Козлова',
  'Павел Орлов',
];

function buildOrders(): OrderRow[] {
  const rnd = mulberry32(42);
  const statuses: OrderRow['status'][] = ['processing', 'processing', 'shipping', 'shipping', 'delivered', 'delivered', 'delivered', 'cancelled'];
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => ({
    id: `№ ${48213 - i * 7}`,
    customer: CUSTOMERS[Math.floor(rnd() * CUSTOMERS.length)],
    amount: Math.round((900 + rnd() * 14000) / 10) * 10,
    status: statuses[Math.min(statuses.length - 1, Math.floor((i / 12) * statuses.length + rnd() * 2))],
    date: new Date(now - i * 47 * 60_000 - rnd() * 30 * 60_000),
  }));
}

const ORDERS = buildOrders();

export function getDashboardData(range: RangeKey): DashboardData {
  const days = RANGES.find((r) => r.value === range)!.days;
  const cur = HISTORY.slice(-days);
  const prev = HISTORY.slice(-2 * days, -days);
  const catTotals = CATEGORIES.map((name, i) => ({ name, value: sum(cur.map((d) => d.categories[i])) }));
  const revenue = revenueOf(cur);
  return {
    range,
    dates: cur.map((d) => d.date),
    sessions: cur.map((d) => d.sessions),
    users: cur.map((d) => d.users),
    kpi: {
      revenue: kpi(cur, prev, revenueOf),
      orders: kpi(cur, prev, ordersOf),
      conversion: kpi(cur, prev, conversionOf),
      avgCheck: kpi(cur, prev, avgCheckOf),
    },
    categories: catTotals.sort((a, b) => b.value - a.value),
    sources: SOURCES.map((name, i) => ({ name, value: sum(cur.map((d) => d.sources[i])) })),
    plan: { target: Math.round((revenueOf(prev) * 1.15) / 100_000) * 100_000, actual: revenue },
    orders: ORDERS,
  };
}
