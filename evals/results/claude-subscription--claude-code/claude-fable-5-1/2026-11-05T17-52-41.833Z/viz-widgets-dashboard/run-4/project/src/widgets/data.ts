/** Демо-данные: детерминированный генератор, чтобы дашборд выглядел одинаково между перезагрузками. */

export interface DailyPoint {
  date: Date;
  web: number;
  mobile: number;
  revenue: number;
  users: number;
}

const DAYS_TOTAL = 120;

function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

let cache: DailyPoint[] | null = null;

export function getDaily(): DailyPoint[] {
  if (cache) return cache;
  const rnd = seeded(2026);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const points: DailyPoint[] = [];
  for (let i = DAYS_TOTAL - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const t = DAYS_TOTAL - 1 - i;
    const weekend = date.getDay() === 0 || date.getDay() === 6 ? 0.78 : 1;
    const growth = 1 + t * 0.0025;
    const web = Math.round((4200 + Math.sin(t / 5) * 350 + (rnd() - 0.5) * 700) * weekend * growth);
    const mobile = Math.round((2600 + Math.cos(t / 7) * 260 + (rnd() - 0.5) * 500) * weekend * growth * 1.004 ** t);
    const revenue = Math.round((web * 92 + mobile * 138) * (0.9 + rnd() * 0.2));
    const users = Math.round((web + mobile) * (0.52 + rnd() * 0.06));
    points.push({ date, web, mobile, revenue, users });
  }
  cache = points;
  return points;
}

/** Последние `days` дней и предыдущий такой же период (для дельты). */
export function getPeriod(days: number) {
  const all = getDaily();
  const current = all.slice(all.length - days);
  const previous = all.slice(Math.max(0, all.length - days * 2), all.length - days);
  return { current, previous };
}

export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
export const avg = (xs: number[]) => (xs.length ? sum(xs) / xs.length : 0);

export const ORDERS_BY_REGION = [
  { name: 'Москва', value: 12840 },
  { name: 'Санкт-Петербург', value: 7310 },
  { name: 'Новосибирск', value: 3120 },
  { name: 'Екатеринбург', value: 2875 },
  { name: 'Казань', value: 2410 },
  { name: 'Нижний Новгород', value: 1930 },
  { name: 'Краснодар', value: 1685 },
];

export const TRAFFIC_SOURCES = [
  { name: 'Поиск', value: 48200 },
  { name: 'Прямые заходы', value: 27600 },
  { name: 'Соцсети', value: 14900 },
  { name: 'Другое', value: 8300 },
];

export const QUOTAS = [
  { name: 'CPU', used: 312, total: 480, unit: 'ядер' },
  { name: 'Память', used: 1.62, total: 2, unit: 'ТБ' },
  { name: 'Диск', used: 41.8, total: 44, unit: 'ТБ' },
  { name: 'Сетевой трафик', used: 7.4, total: 20, unit: 'ТБ' },
];

export type EventStatus = 'ok' | 'warning' | 'error';

export interface EventRow {
  id: string;
  time: Date;
  title: string;
  service: string;
  status: EventStatus;
}

export function getEvents(): EventRow[] {
  const now = new Date();
  const at = (minAgo: number) => new Date(now.getTime() - minAgo * 60000);
  return [
    { id: 'e1', time: at(4), title: 'Деплой v2.41.0 завершён', service: 'api-gateway', status: 'ok' },
    { id: 'e2', time: at(17), title: 'Задержка очереди выше 2 с', service: 'billing-worker', status: 'warning' },
    { id: 'e3', time: at(36), title: 'Ночной бэкап выполнен', service: 'postgres-main', status: 'ok' },
    { id: 'e4', time: at(58), title: 'Ошибки 5xx: 1,8 % за 5 минут', service: 'checkout', status: 'error' },
    { id: 'e5', time: at(95), title: 'Автомасштабирование: +3 узла', service: 'k8s-prod', status: 'ok' },
    { id: 'e6', time: at(140), title: 'Сертификат истекает через 9 дней', service: 'edge-proxy', status: 'warning' },
    { id: 'e7', time: at(210), title: 'Индекс пересобран', service: 'search', status: 'ok' },
    { id: 'e8', time: at(300), title: 'Ротация ключей выполнена', service: 'vault', status: 'ok' },
  ];
}
