export type RangeKey = '7d' | '30d' | '90d';

export const RANGE_DAYS: Record<RangeKey, number> = {'7d': 7, '30d': 30, '90d': 90};

export interface Series {
  name: string;
  values: number[];
}

export interface StatValue {
  value: number;
  /** Fractional change vs the previous period of the same length. */
  delta: number;
  trend: number[];
}

export interface OrderRow {
  id: string;
  customer: string;
  amount: number;
  status: 'paid' | 'processing' | 'cancelled';
  date: Date;
}

export interface DashboardData {
  range: RangeKey;
  dates: Date[];
  sessions: Series[];
  stats: {
    users: StatValue;
    revenue: StatValue;
    conversion: StatValue;
    errors: StatValue;
  };
  pages: Array<{name: string; value: number}>;
  sources: Array<{name: string; value: number}>;
  /** 7 days × 24 hours */
  activity: number[][];
  orders: OrderRow[];
}

/* Deterministic PRNG so every range renders the same picture on every load. */
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

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysBack(from: Date, count: number): Date[] {
  const out: Date[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(d);
  }
  return out;
}

function sum(values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}

function stat(current: number[], previous: number[], mode: 'sum' | 'mean' = 'sum', trendPoints = 12): StatValue {
  const aggregate = (values: number[]) => (mode === 'sum' ? sum(values) : values.length ? sum(values) / values.length : 0);
  const cur = aggregate(current);
  const prev = aggregate(previous);
  const delta = prev === 0 ? 0 : (cur - prev) / prev;
  // Up to 12-point sparkline: bucket the current period into equal slices.
  const bucket = Math.max(1, Math.floor(current.length / trendPoints));
  const trend: number[] = [];
  for (let i = 0; i < current.length; i += bucket) trend.push(aggregate(current.slice(i, i + bucket)));
  return {value: cur, delta, trend: trend.slice(-trendPoints)};
}

export function generateData(range: RangeKey, today = new Date()): DashboardData {
  const days = RANGE_DAYS[range];
  const rand = mulberry32(days * 7919);
  const end = startOfDay(today);
  const allDates = daysBack(end, days * 2);
  const dates = allDates.slice(days);

  const platforms = [
    {name: 'Web', base: 1400, growth: 0.004},
    {name: 'iOS', base: 820, growth: 0.006},
    {name: 'Android', base: 610, growth: 0.002},
  ];
  const full = platforms.map((p) => ({
    name: p.name,
    values: allDates.map((d, i) => {
      const weekday = d.getDay();
      const weekend = weekday === 0 || weekday === 6 ? 0.72 : 1;
      const trend = 1 + p.growth * (i - days);
      const noise = 0.85 + rand() * 0.3;
      return Math.round(p.base * weekend * trend * noise);
    }),
  }));
  const sessions = full.map((s) => ({name: s.name, values: s.values.slice(days)}));
  const totals = allDates.map((_, i) => sum(full.map((s) => s.values[i])));
  const revenue = totals.map((t) => Math.round(t * (38 + rand() * 6)));
  const conversion = totals.map(() => 0.028 + (rand() - 0.5) * 0.008);
  const errors = totals.map((t) => Math.round(t * (0.004 + rand() * 0.004)));

  const half = (values: number[]) => [values.slice(days), values.slice(0, days)] as const;
  const [curT, prevT] = half(totals);
  const [curR, prevR] = half(revenue);
  const [curC, prevC] = half(conversion);
  const [curE, prevE] = half(errors);

  const pageNames = ['/pricing', '/docs/getting-started', '/blog/launch', '/', '/integrations', '/docs/api', '/changelog', '/about'];
  const pages = pageNames
    .map((name, i) => ({name, value: Math.round(sum(curT) * (0.22 - i * 0.022) * (0.9 + rand() * 0.2))}))
    .sort((a, b) => b.value - a.value);

  const sourceNames = ['Органика', 'Прямые', 'Рефералы', 'Соцсети', 'Email'];
  const sourceShare = [0.41, 0.24, 0.16, 0.12, 0.07];
  const sources = sourceNames.map((name, i) => ({name, value: Math.round(sum(curT) * sourceShare[i] * (0.9 + rand() * 0.2))}));

  const activity = Array.from({length: 7}, (_, day) =>
    Array.from({length: 24}, (_, hour) => {
      const daytime = Math.exp(-((hour - 14) ** 2) / 40);
      const weekend = day >= 5 ? 0.55 : 1;
      return Math.round((sum(curT) / days / 24) * (0.2 + 2.2 * daytime) * weekend * (0.8 + rand() * 0.4));
    }),
  );

  const customers = ['ООО «Вектор»', 'ИП Смирнова', 'АО «Северсталь-Лаб»', 'ООО «Кварк»', 'ИП Петров', 'ООО «Орбита»', 'ООО «Лента-Сервис»', 'ИП Иванова', 'ООО «Гелиос»', 'АО «Прометей»', 'ООО «Марс-Тех»', 'ИП Козлов'];
  const statuses: OrderRow['status'][] = ['paid', 'paid', 'paid', 'processing', 'paid', 'cancelled', 'processing', 'paid'];
  const orders: OrderRow[] = customers.map((customer, i) => {
    const date = new Date(end);
    date.setDate(date.getDate() - Math.floor(rand() * Math.min(days, 14)));
    date.setHours(9 + Math.floor(rand() * 10), Math.floor(rand() * 60));
    return {
      id: `#${(48210 + days * 3 + i * 7).toString()}`,
      customer,
      amount: Math.round((900 + rand() * 24000) / 10) * 10,
      status: statuses[Math.floor(rand() * statuses.length)],
      date,
    };
  });
  orders.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    range,
    dates,
    sessions,
    stats: {
      users: stat(curT, prevT),
      revenue: stat(curR, prevR),
      conversion: stat(curC, prevC, 'mean'),
      errors: stat(curE, prevE),
    },
    pages,
    sources,
    activity,
    orders,
  };
}
