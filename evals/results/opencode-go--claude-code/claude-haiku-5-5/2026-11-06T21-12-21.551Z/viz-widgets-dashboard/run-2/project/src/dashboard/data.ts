// Deterministic demo data. Same numbers on every load, so layouts can be judged by eye.

export const DAYS = 30;

/** Mulberry32: small seeded PRNG returning values in [0, 1). */
function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function series(seed: number, base: number, wobble: number, noise: number): number[] {
  const rnd = seeded(seed);
  return Array.from({ length: DAYS }, (_, i) => {
    const wave = 1 + wobble * Math.sin(i / 4.5);
    const jitter = 1 + noise * (rnd() * 2 - 1);
    return Math.round(base * wave * jitter);
  });
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

const DATE_FORMAT = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Labels for the last DAYS days, ending 2026-11-05 (UTC, so no timezone drift). */
export const dayLabels: string[] = Array.from({ length: DAYS }, (_, i) =>
  DATE_FORMAT.format(new Date(Date.UTC(2026, 9, 7 + i))),
);

export const revenueCurrent = series(11, 380_000, 0.22, 0.14);
export const revenuePrevious = series(23, 345_000, 0.2, 0.16);

const AVG_CHECK_CURRENT = 3_400;
const AVG_CHECK_PREVIOUS = 3_520;
const CONVERSION_CURRENT = 0.038;
const CONVERSION_PREVIOUS = 0.0365;

export const ordersCurrent = revenueCurrent.map((r) => Math.round(r / AVG_CHECK_CURRENT));
export const ordersPrevious = revenuePrevious.map((r) => Math.round(r / AVG_CHECK_PREVIOUS));

export const sessionsCurrent = ordersCurrent.map((o, i) =>
  Math.round(o / (CONVERSION_CURRENT * (1 + 0.04 * Math.sin(i)))),
);
export const sessionsPrevious = ordersPrevious.map((o, i) =>
  Math.round(o / (CONVERSION_PREVIOUS * (1 + 0.04 * Math.cos(i)))),
);

export interface Totals {
  revenue: number;
  orders: number;
  avgCheck: number;
  conversion: number;
}

function totals(revenue: number[], orders: number[], sessions: number[]): Totals {
  const r = sum(revenue);
  const o = sum(orders);
  return { revenue: r, orders: o, avgCheck: r / o, conversion: o / sum(sessions) };
}

export const totalsCurrent = totals(revenueCurrent, ordersCurrent, sessionsCurrent);
export const totalsPrevious = totals(revenuePrevious, ordersPrevious, sessionsPrevious);

/** Relative change, e.g. 0.084 for +8.4%. */
export const change = (cur: number, prev: number) => cur / prev - 1;

export const revenueTrend = revenueCurrent.slice(-14);
export const ordersTrend = ordersCurrent.slice(-14);
export const avgCheckTrend = revenueCurrent.slice(-14).map((r, i) => Math.round(r / ordersCurrent.slice(-14)[i]));
export const conversionTrend = ordersCurrent.slice(-14).map((o, i) => o / sessionsCurrent.slice(-14)[i]);

/** Channel and segment shares of current revenue. Sums to 1 within each group. */
export const channelShares: Array<{ name: string; share: number }> = [
  { name: 'Поиск', share: 0.37 },
  { name: 'Соцсети', share: 0.27 },
  { name: 'Email', share: 0.17 },
  { name: 'Реклама', share: 0.12 },
  { name: 'Партнёры', share: 0.07 },
];

export const segmentShares: Array<{ name: string; share: number }> = [
  { name: 'Розница', share: 0.52 },
  { name: 'Онлайн', share: 0.36 },
  { name: 'Опт', share: 0.12 },
];

export type OrderStatus = 'delivered' | 'shipping' | 'paid' | 'awaiting';

export interface Order {
  id: number;
  client: string;
  channel: string;
  amount: number;
  status: OrderStatus;
}

export const recentOrders: Order[] = [
  { id: 10482, client: 'ООО «Вектор»', channel: 'Email', amount: 186_400, status: 'shipping' },
  { id: 10481, client: 'ИП Смирнова', channel: 'Поиск', amount: 12_900, status: 'delivered' },
  { id: 10480, client: 'Лаборатория «Север»', channel: 'Партнёры', amount: 248_000, status: 'paid' },
  { id: 10479, client: 'Кафе «Белый дом»', channel: 'Соцсети', amount: 34_750, status: 'delivered' },
  { id: 10478, client: 'Студия «Лотос»', channel: 'Реклама', amount: 9_800, status: 'awaiting' },
  { id: 10477, client: 'ТехноСфера', channel: 'Поиск', amount: 512_300, status: 'shipping' },
  { id: 10476, client: 'Аптека № 7', channel: 'Email', amount: 73_200, status: 'delivered' },
  { id: 10475, client: 'Типография «Лайт»', channel: 'Соцсети', amount: 41_050, status: 'paid' },
  { id: 10474, client: 'Школа «Пифагор»', channel: 'Реклама', amount: 27_600, status: 'awaiting' },
];
