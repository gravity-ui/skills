/** Детерминированные демонстрационные данные (без случайности, чтобы снимки были стабильны). */

const DAYS = 30;
const START = Date.UTC(2026, 9, 7); // 7 октября 2026 → 30 дней до 5 ноября

const wave = (i: number, period: number, phase = 0) => Math.sin(((i + phase) / period) * Math.PI * 2);

export interface Point {
  date: Date;
  values: Record<string, number>;
}

export const TRAFFIC_SERIES = [
  { id: 'web', name: 'Веб', slot: 1 },
  { id: 'mobile', name: 'Мобильные', slot: 2 },
] as const;

export const traffic: Point[] = Array.from({ length: DAYS }, (_, i) => {
  const weekend = [5, 6].includes((i + 2) % 7) ? -0.18 : 0;
  const web = 9200 + i * 85 + 1400 * wave(i, 7, 1.5) + 600 * wave(i, 11) + 9200 * weekend;
  const mobile = 6100 + i * 140 + 900 * wave(i, 7, 2) + 500 * wave(i, 9, 3) + 6100 * weekend * 0.4;
  return {
    date: new Date(START + i * 86_400_000),
    values: { web: Math.round(web), mobile: Math.round(mobile) },
  };
});

export const revenueByChannel = [
  { name: 'Органика', value: 412_500 },
  { name: 'Платный поиск', value: 286_900 },
  { name: 'Email', value: 164_300 },
  { name: 'Партнёры', value: 128_800 },
  { name: 'Соцсети', value: 97_400 },
  { name: 'Прямые', value: 72_100 },
];

export const trafficShare = [
  { name: 'Органика', value: 38 },
  { name: 'Платный', value: 27 },
  { name: 'Email', value: 19 },
  { name: 'Другое', value: 16 },
];

export interface Kpi {
  id: string;
  label: string;
  value: number;
  format: 'money' | 'number' | 'percent';
  delta: number; // в процентах к прошлому периоду
  upIsGood: boolean;
  trend: number[];
  hero?: boolean;
}

const spark = (base: number, amp: number, drift: number, phase: number) =>
  Array.from({ length: 12 }, (_, i) => Math.round(base + i * drift + amp * wave(i, 5, phase)));

export const kpis: Kpi[] = [
  {
    id: 'revenue',
    label: 'Выручка за 30 дней',
    value: 1_162_000,
    format: 'money',
    delta: 8.4,
    upIsGood: true,
    trend: spark(880, 40, 22, 1),
    hero: true,
  },
  {
    id: 'users',
    label: 'Активные пользователи',
    value: 48_210,
    format: 'number',
    delta: 3.1,
    upIsGood: true,
    trend: spark(4100, 180, 60, 2),
  },
  {
    id: 'conversion',
    label: 'Конверсия в заказ',
    value: 3.42,
    format: 'percent',
    delta: -0.6,
    upIsGood: true,
    trend: spark(350, 14, -1, 0),
  },
  {
    id: 'errors',
    label: 'Ошибки 5xx',
    value: 0.18,
    format: 'percent',
    delta: -22,
    upIsGood: false,
    trend: spark(30, 6, -1.2, 3),
  },
];

export const topPages = [
  { path: '/', views: 128_430, avgTime: 74, bounce: 31.2 },
  { path: '/pricing', views: 54_112, avgTime: 118, bounce: 22.8 },
  { path: '/docs/getting-started', views: 41_908, avgTime: 243, bounce: 18.5 },
  { path: '/blog/release-2026-10', views: 23_775, avgTime: 192, bounce: 44.1 },
  { path: '/integrations', views: 17_306, avgTime: 96, bounce: 37.9 },
  { path: '/changelog', views: 12_044, avgTime: 61, bounce: 52.3 },
  { path: '/login', views: 9_870, avgTime: 22, bounce: 8.4 },
];

export type Severity = 'good' | 'warning' | 'critical';

export const meters: { name: string; value: number; severity: Severity; detail: string }[] = [
  { name: 'CPU', value: 62, severity: 'good', detail: '12 ядер' },
  { name: 'Память', value: 81, severity: 'warning', detail: '52 из 64 ГБ' },
  { name: 'Диск', value: 93, severity: 'critical', detail: '1,86 из 2 ТБ' },
  { name: 'Сеть', value: 34, severity: 'good', detail: '3,4 из 10 Гбит/с' },
];

export const activity: { id: number; time: string; title: string; detail: string; severity: Severity }[] = [
  { id: 1, time: '14:52', title: 'Деплой api v2.14.0', detail: 'production · 3 мин', severity: 'good' },
  { id: 2, time: '13:20', title: 'Диск > 90 %', detail: 'db-primary-1', severity: 'critical' },
  { id: 3, time: '12:05', title: 'Рост латентности p95', detail: 'checkout · 820 мс', severity: 'warning' },
  { id: 4, time: '10:41', title: 'Ротация сертификатов', detail: '*.example.com', severity: 'good' },
  { id: 5, time: '09:17', title: 'Бэкап завершён', detail: '412 ГБ · S3', severity: 'good' },
  { id: 6, time: '08:03', title: 'Очередь задач > 5 000', detail: 'worker-pool-b', severity: 'warning' },
];

/* ---------- форматирование ---------- */

const nf = new Intl.NumberFormat('ru-RU');

export function formatNumber(n: number): string {
  return nf.format(Math.round(n));
}

export function formatCompact(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace('.', ',')} млн`;
  if (abs >= 10_000) return `${Math.round(n / 1000)} тыс.`;
  return nf.format(Math.round(n));
}

export function formatMoney(n: number): string {
  return `${formatCompact(n)} ₽`;
}

export function formatPercent(n: number, digits = 1): string {
  return `${n.toFixed(digits).replace('.', ',')} %`;
}

export function formatValue(n: number, format: Kpi['format']): string {
  if (format === 'money') return formatMoney(n);
  if (format === 'percent') return formatPercent(n, 2);
  return formatCompact(n);
}

export function formatDate(d: Date, style: 'short' | 'long' = 'short'): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: style === 'short' ? 'short' : 'long',
    timeZone: 'UTC',
  }).format(d);
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m} мин ${s.toString().padStart(2, '0')} с` : `${s} с`;
}

/** Круглые деления оси: 4–5 штук от 0. */
export function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const rough = max / count;
  const pow = 10 ** Math.floor(Math.log10(rough));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? rough;
  const ticks: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
  return ticks;
}
