/**
 * Детерминированные демо-данные, зависящие от выбранного периода.
 * Все числа генерируются сидированным ГПСЧ, поэтому при одном периоде
 * дашборд всегда показывает одинаковые значения.
 */

export type Range = '7d' | '30d' | '90d';

export const RANGE_OPTIONS: { value: Range; label: string; days: number }[] = [
  { value: '7d', label: '7 дней', days: 7 },
  { value: '30d', label: '30 дней', days: 30 },
  { value: '90d', label: '90 дней', days: 90 },
];

export interface Point {
  date: Date;
  label: string;
}

export interface RevenueSeries {
  points: Point[];
  /** Выручка от новых подписок, ₽ */
  newRevenue: number[];
  /** Выручка от продлений, ₽ */
  renewals: number[];
}

export interface Kpi {
  value: number;
  /** Изменение к предыдущему периоду в долях (0.12 = +12 %) */
  delta: number;
  /** 12 точек тренда */
  trend: number[];
  /** Рост — хорошо? (для churn — нет) */
  upIsGood: boolean;
}

export interface Channel {
  name: string;
  value: number;
}

export interface Plan {
  name: string;
  value: number;
}

export interface Quota {
  used: number;
  limit: number;
  unit: string;
}

export type OrderStatus = 'paid' | 'pending' | 'failed';

export interface Order {
  id: string;
  customer: string;
  plan: string;
  amount: number;
  status: OrderStatus;
  date: Date;
}

export type ServiceStatus = 'ok' | 'degraded' | 'down';

export interface Service {
  name: string;
  status: ServiceStatus;
  latencyMs: number;
  uptime: number;
}

export interface DashboardData {
  range: Range;
  revenue: RevenueSeries;
  kpis: { mrr: Kpi; users: Kpi; conversion: Kpi; churn: Kpi };
  channels: Channel[];
  plans: Plan[];
  quota: Quota;
  orders: Order[];
  services: Service[];
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

const TODAY = new Date(2026, 10, 5);

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

const shortDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

function trend(rand: () => number, base: number, drift: number, noise: number, n = 12): number[] {
  const out: number[] = [];
  let value = base;
  for (let i = 0; i < n; i += 1) {
    value = value * (1 + drift) + (rand() - 0.5) * noise;
    out.push(Math.max(0, value));
  }
  return out;
}

const CUSTOMERS = ['Альфа-Сервис', 'Северный ветер', 'Кварта', 'Лабиринт', 'ИнфоТех', 'Орбита', 'Пульс', 'Меридиан', 'Вектор-М', 'Сигма', 'Аркада', 'Фортис'];
const PLANS = ['Start', 'Pro', 'Business', 'Enterprise'];

export function getDashboardData(range: Range): DashboardData {
  const days = RANGE_OPTIONS.find((option) => option.value === range)?.days ?? 30;
  const rand = mulberry32(1000 + days);

  // Выручка по дням, затем агрегируем для 90 дней понедельно.
  const dailyNew: number[] = [];
  const dailyRenew: number[] = [];
  let level = 180_000;
  for (let i = 0; i < days; i += 1) {
    level *= 1 + (rand() - 0.47) * 0.04;
    const weekend = addDays(TODAY, i - days + 1).getDay() % 6 === 0 ? 0.55 : 1;
    dailyNew.push(Math.round(level * weekend * (0.8 + rand() * 0.4)));
    dailyRenew.push(Math.round(level * 1.6 * weekend * (0.9 + rand() * 0.2)));
  }

  const bucket = days > 31 ? 7 : 1;
  const points: Point[] = [];
  const newRevenue: number[] = [];
  const renewals: number[] = [];
  for (let start = 0; start < days; start += bucket) {
    const end = Math.min(days, start + bucket);
    const date = addDays(TODAY, start - days + 1);
    points.push({ date, label: shortDate.format(date) });
    newRevenue.push(dailyNew.slice(start, end).reduce((sum, v) => sum + v, 0));
    renewals.push(dailyRenew.slice(start, end).reduce((sum, v) => sum + v, 0));
  }

  const total = dailyNew.reduce((s, v) => s + v, 0) + dailyRenew.reduce((s, v) => s + v, 0);

  const kpis = {
    mrr: { value: Math.round(total / days) * 30, delta: 0.03 + rand() * 0.09, trend: trend(rand, 100, 0.012, 6), upIsGood: true },
    users: { value: Math.round(18_400 + days * 85 + rand() * 900), delta: 0.02 + rand() * 0.06, trend: trend(rand, 100, 0.009, 5), upIsGood: true },
    conversion: { value: 0.031 + rand() * 0.012, delta: -0.01 + rand() * 0.04, trend: trend(rand, 100, 0.002, 8), upIsGood: true },
    churn: { value: 0.018 + rand() * 0.012, delta: -0.02 + rand() * 0.03, trend: trend(rand, 100, -0.004, 7), upIsGood: false },
  };

  const channelNames = ['Органический поиск', 'Реклама', 'Рекомендации', 'Соцсети', 'Email-рассылки', 'Партнёры', 'Прямые заходы'];
  const channels = channelNames
    .map((name, index) => ({ name, value: Math.round((1800 - index * 190 + rand() * 500) * (days / 30)) }))
    .sort((a, b) => b.value - a.value);

  const plans: Plan[] = [
    { name: 'Start', value: Math.round(5200 + rand() * 800) },
    { name: 'Pro', value: Math.round(3100 + rand() * 600) },
    { name: 'Business', value: Math.round(1400 + rand() * 300) },
    { name: 'Enterprise', value: Math.round(260 + rand() * 90) },
  ];

  const quota: Quota = { used: Math.round(620 + days * 2.4 + rand() * 60), limit: 1000, unit: 'ГБ' };

  const orders: Order[] = Array.from({ length: 14 }, (_, index) => {
    const statusRoll = rand();
    const status: OrderStatus = statusRoll > 0.85 ? 'failed' : statusRoll > 0.7 ? 'pending' : 'paid';
    const plan = PLANS[Math.floor(rand() * PLANS.length)];
    const amountByPlan: Record<string, number> = { Start: 2_900, Pro: 7_900, Business: 19_900, Enterprise: 54_000 };
    return {
      id: `ORD-${(4800 + days * 3 + index).toString()}`,
      customer: CUSTOMERS[Math.floor(rand() * CUSTOMERS.length)],
      plan,
      amount: amountByPlan[plan] * (1 + Math.floor(rand() * 3)),
      status,
      date: addDays(TODAY, -Math.floor(rand() * Math.min(days, 14))),
    };
  }).sort((a, b) => b.date.getTime() - a.date.getTime());

  const services: Service[] = [
    { name: 'API Gateway', status: 'ok', latencyMs: Math.round(42 + rand() * 20), uptime: 99.98 },
    { name: 'Биллинг', status: rand() > 0.5 ? 'degraded' : 'ok', latencyMs: Math.round(120 + rand() * 90), uptime: 99.91 },
    { name: 'Очередь задач', status: 'ok', latencyMs: Math.round(15 + rand() * 10), uptime: 100 },
    { name: 'Поиск', status: rand() > 0.7 ? 'down' : 'ok', latencyMs: Math.round(210 + rand() * 140), uptime: 99.4 },
    { name: 'Уведомления', status: 'ok', latencyMs: Math.round(60 + rand() * 30), uptime: 99.95 },
  ];

  return { range, revenue: { points, newRevenue, renewals }, kpis, channels, plans, quota, orders, services };
}

/* ---------- форматирование ---------- */

const compactRub = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const fullNumber = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1 });
const signedPercent = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1, signDisplay: 'always' });
const dateTime = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

export const fmt = {
  compact: (value: number) => compactRub.format(value),
  compactRub: (value: number) => `${compactRub.format(value)} ₽`,
  number: (value: number) => fullNumber.format(value),
  rub: (value: number) => `${fullNumber.format(value)} ₽`,
  percent: (value: number) => percent.format(value),
  signedPercent: (value: number) => signedPercent.format(value),
  date: (value: Date) => dateTime.format(value),
};
