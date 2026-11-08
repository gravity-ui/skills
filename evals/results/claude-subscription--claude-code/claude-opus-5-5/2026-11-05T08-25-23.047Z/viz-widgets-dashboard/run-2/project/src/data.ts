/**
 * Deterministic demo data for the dashboard. One 180-day history is generated
 * once; every period is a slice of it, so 7 days is literally the tail of the
 * 30-day view and all widgets always agree with each other.
 */

export type Period = 7 | 30 | 90;

export const CHANNELS = ['Органический поиск', 'Контекстная реклама', 'Email-рассылки', 'Соцсети', 'Партнёры'] as const;
export const SOURCES = ['Поиск', 'Прямые заходы', 'Соцсети', 'Рефералы', 'Email'] as const;

interface Day {
  date: Date;
  desktop: number;
  mobile: number;
  orders: number;
  revenue: number;
  channelRevenue: number[];
  sourceVisits: number[];
}

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function split(total: number, weights: readonly number[], rnd: () => number) {
  const noisy = weights.map((w) => w * (0.85 + rnd() * 0.3));
  const sum = noisy.reduce((a, b) => a + b, 0);
  return noisy.map((w) => (total * w) / sum);
}

const HISTORY_DAYS = 180;

const history: Day[] = (() => {
  const rnd = mulberry32(20261105);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Day[] = [];
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - (HISTORY_DAYS - 1 - i));
    const dow = date.getDay();
    const weekend = dow === 0 || dow === 6;
    const trend = i / HISTORY_DAYS;
    const desktop = Math.round((2600 + 900 * trend) * (weekend ? 0.62 : 1) * (0.9 + rnd() * 0.2));
    const mobile = Math.round((2900 + 1500 * trend) * (weekend ? 1.18 : 1) * (0.9 + rnd() * 0.2));
    const visits = desktop + mobile;
    const conversion = 0.021 + 0.004 * trend + (rnd() - 0.5) * 0.004;
    const orders = Math.round(visits * conversion);
    const revenue = Math.round(orders * (3100 + rnd() * 700));
    days.push({
      date,
      desktop,
      mobile,
      orders,
      revenue,
      channelRevenue: split(revenue, [38, 27, 14, 12, 9], rnd),
      sourceVisits: split(visits, [44, 23, 15, 11, 7], rnd),
    });
  }
  return days;
})();

const PAGES = [
  { path: '/', title: 'Главная', weight: 30, time: 48, bounce: 0.34 },
  { path: '/catalog', title: 'Каталог', weight: 21, time: 95, bounce: 0.22 },
  { path: '/catalog/sneakers', title: 'Кроссовки', weight: 12, time: 112, bounce: 0.27 },
  { path: '/sale', title: 'Распродажа', weight: 10, time: 76, bounce: 0.31 },
  { path: '/cart', title: 'Корзина', weight: 8, time: 64, bounce: 0.18 },
  { path: '/blog/how-to-choose', title: 'Как выбрать размер', weight: 6, time: 184, bounce: 0.52 },
  { path: '/delivery', title: 'Доставка и оплата', weight: 5, time: 57, bounce: 0.46 },
  { path: '/contacts', title: 'Контакты', weight: 3, time: 33, bounce: 0.61 },
];

export interface Kpi {
  value: number;
  previous: number;
  trend: number[];
}

export interface DashboardData {
  period: Period;
  dates: Date[];
  desktop: number[];
  mobile: number[];
  revenue: Kpi;
  orders: Kpi;
  conversion: Kpi;
  channels: { name: string; value: number }[];
  sources: { name: string; value: number }[];
  pages: { path: string; title: string; views: number; time: number; bounce: number }[];
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

export function getDashboardData(period: Period): DashboardData {
  const current = history.slice(-period);
  const previous = history.slice(-2 * period, -period);
  const visits = (days: Day[]) => sum(days.map((d) => d.desktop + d.mobile));
  const conv = (days: Day[]) => sum(days.map((d) => d.orders)) / visits(days);

  const totalVisits = visits(current);
  const rnd = mulberry32(period);

  return {
    period,
    dates: current.map((d) => d.date),
    desktop: current.map((d) => d.desktop),
    mobile: current.map((d) => d.mobile),
    revenue: {
      value: sum(current.map((d) => d.revenue)),
      previous: sum(previous.map((d) => d.revenue)),
      trend: current.map((d) => d.revenue),
    },
    orders: {
      value: sum(current.map((d) => d.orders)),
      previous: sum(previous.map((d) => d.orders)),
      trend: current.map((d) => d.orders),
    },
    conversion: {
      value: conv(current),
      previous: conv(previous),
      trend: current.map((d) => d.orders / (d.desktop + d.mobile)),
    },
    channels: CHANNELS.map((name, i) => ({
      name,
      value: Math.round(sum(current.map((d) => d.channelRevenue[i]))),
    })).sort((a, b) => b.value - a.value),
    sources: SOURCES.map((name, i) => ({
      name,
      value: Math.round(sum(current.map((d) => d.sourceVisits[i]))),
    })),
    pages: (() => {
      const weights = sum(PAGES.map((p) => p.weight));
      return PAGES.map((p) => ({
        path: p.path,
        title: p.title,
        views: Math.round(((totalVisits * 1.9 * p.weight) / weights) * (0.92 + rnd() * 0.16)),
        time: Math.round(p.time * (0.9 + rnd() * 0.2)),
        bounce: p.bounce * (0.9 + rnd() * 0.2),
      })).sort((a, b) => b.views - a.views);
    })(),
  };
}

// ---------- formatting ----------

const intFormat = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const compactFormat = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const rubCompact = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const rubFull = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const pctFormat = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1, minimumFractionDigits: 1 });
const pct2Format = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 2, minimumFractionDigits: 2 });
const dayFormat = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
const longDayFormat = new Intl.DateTimeFormat('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' });

export const fmt = {
  int: (n: number) => intFormat.format(n),
  /** Full under 10 000, compact above — one style per axis is chosen by the caller. */
  smart: (n: number) => (Math.abs(n) < 10_000 ? intFormat.format(n) : compactFormat.format(n)),
  compact: (n: number) => compactFormat.format(n),
  rub: (n: number) => rubFull.format(n),
  rubCompact: (n: number) => rubCompact.format(n),
  pct: (n: number) => pctFormat.format(n),
  pct2: (n: number) => pct2Format.format(n),
  day: (d: Date) => dayFormat.format(d),
  longDay: (d: Date) => longDayFormat.format(d),
  duration: (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`,
};
