/** Детерминированные демо-данные интернет-магазина. */

export type RangeKey = '7' | '30' | '90';

export interface Stat {
  value: number;
  previous: number;
  /** 12 точек для спарклайна, по текущему периоду. */
  trend: number[];
}

export interface OrderRow {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'shipping' | 'cancelled';
  time: Date;
}

export interface DashboardData {
  days: Date[];
  visitsNew: number[];
  visitsReturning: number[];
  revenue: Stat;
  orders: Stat;
  conversion: Stat;
  avgCheck: Stat;
  categories: { name: string; value: number }[];
  sources: { name: string; value: number }[];
  plan: { current: number; target: number };
  recentOrders: OrderRow[];
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);

function buckets(values: number[], count: number, reduce: (chunk: number[]) => number): number[] {
  const out: number[] = [];
  for (let b = 0; b < count; b++) {
    const from = Math.floor((b * values.length) / count);
    const to = Math.max(from + 1, Math.floor(((b + 1) * values.length) / count));
    out.push(reduce(values.slice(from, to)));
  }
  return out;
}

const CATEGORIES = [
  ['Электроника', 0.31],
  ['Одежда и обувь', 0.22],
  ['Дом и сад', 0.17],
  ['Красота', 0.12],
  ['Спорт', 0.1],
  ['Книги', 0.08],
] as const;

const SOURCES = [
  ['Поиск', 0.41],
  ['Прямые заходы', 0.23],
  ['Соцсети', 0.16],
  ['Email-рассылки', 0.11],
  ['Реклама', 0.09],
] as const;

const CUSTOMERS = [
  'Анна Смирнова',
  'Игорь Петров',
  'Мария Кузнецова',
  'Дмитрий Волков',
  'Елена Соколова',
  'Алексей Морозов',
  'Ольга Новикова',
  'Сергей Лебедев',
];

const STATUSES: OrderRow['status'][] = ['paid', 'shipping', 'paid', 'cancelled', 'shipping', 'paid', 'paid', 'shipping'];

export function makeData(range: RangeKey, today = new Date()): DashboardData {
  const n = Number(range);
  const rnd = mulberry32(n * 7919 + 17);
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // 2n дней: первая половина — предыдущий период для сравнения.
  const all = Array.from({ length: n * 2 }, (_, k) => {
    const date = new Date(end);
    date.setDate(end.getDate() - (n * 2 - 1 - k));
    const weekday = date.getDay();
    const weekend = weekday === 0 || weekday === 6 ? 0.78 : 1;
    const trend = 1 + (k / (n * 2)) * 0.12;
    const fresh = Math.round(1850 * weekend * trend * (0.9 + rnd() * 0.2));
    const returning = Math.round(1240 * (weekend * 0.9 + 0.1) * trend * (0.88 + rnd() * 0.24));
    const conv = 0.024 + rnd() * 0.008 + (k >= n ? 0.002 : 0);
    const orders = Math.round((fresh + returning) * conv);
    const check = 3100 + rnd() * 600;
    return { date, fresh, returning, orders, revenue: Math.round(orders * check) };
  });

  const prev = all.slice(0, n);
  const cur = all.slice(n);

  const stat = (pick: (d: (typeof all)[number]) => number, chunk = sum): Stat => ({
    value: sum(cur.map(pick)),
    previous: sum(prev.map(pick)),
    trend: buckets(cur.map(pick), 12, chunk),
  });

  const revenue = stat((d) => d.revenue);
  const orders = stat((d) => d.orders);
  const visits = (ds: typeof all) => sum(ds.map((d) => d.fresh + d.returning));
  const conversion: Stat = {
    value: (orders.value / visits(cur)) * 100,
    previous: (orders.previous / visits(prev)) * 100,
    trend: buckets(
      cur.map((d) => (d.orders / (d.fresh + d.returning)) * 100),
      12,
      (c) => sum(c) / c.length,
    ),
  };
  const avgCheck: Stat = {
    value: revenue.value / orders.value,
    previous: revenue.previous / orders.previous,
    trend: buckets(
      cur.map((d) => d.revenue / Math.max(d.orders, 1)),
      12,
      (c) => sum(c) / c.length,
    ),
  };

  const totalVisits = visits(cur);
  const splitBy = (shares: readonly (readonly [string, number])[], total: number) => {
    const raw = shares.map(([, s]) => s * (0.85 + rnd() * 0.3));
    const norm = sum(raw);
    return shares.map(([name], idx) => ({ name, value: Math.round((raw[idx] / norm) * total) }));
  };

  const recentOrders: OrderRow[] = CUSTOMERS.map((customer, idx) => {
    const time = new Date(today.getTime() - (idx * 37 + Math.round(rnd() * 20)) * 60_000);
    return {
      id: `№ ${48213 - idx * 3 - Math.round(rnd() * 2)}`,
      customer,
      amount: Math.round((1200 + rnd() * 14000) / 10) * 10,
      status: STATUSES[idx],
      time,
    };
  });

  return {
    days: cur.map((d) => d.date),
    visitsNew: cur.map((d) => d.fresh),
    visitsReturning: cur.map((d) => d.returning),
    revenue,
    orders,
    conversion,
    avgCheck,
    categories: splitBy(CATEGORIES, revenue.value).sort((a, b) => b.value - a.value),
    sources: splitBy(SOURCES, totalVisits),
    plan: { current: revenue.value, target: Math.round((n * 340_000) / 100_000) * 100_000 },
    recentOrders,
  };
}
