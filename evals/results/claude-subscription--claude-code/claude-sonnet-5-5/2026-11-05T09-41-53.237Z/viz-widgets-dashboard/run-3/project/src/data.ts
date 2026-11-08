/** Детерминированные демо-данные: 180 дней продаж магазина. */

export const CHANNELS = ['Органический поиск', 'Платная реклама', 'E-mail', 'Соцсети', 'Партнёры', 'Прямые заходы'];
const SHARES = [0.31, 0.24, 0.14, 0.12, 0.1, 0.09];
export const BLOCKS = ['0–4', '4–8', '8–12', '12–16', '16–20', '20–24'];
export const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

export interface Day {
  date: Date;
  revenue: number;
  orders: number;
  visitors: number;
  byChannel: number[];
  /** Заказы по 4-часовым блокам суток. */
  byBlock: number[];
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEEKDAY_FACTOR = [1.0, 1.04, 1.06, 1.02, 0.97, 0.82, 0.8];
const WEEKDAY_PROFILE = [0.04, 0.1, 0.28, 0.3, 0.2, 0.08];
const WEEKEND_PROFILE = [0.08, 0.12, 0.22, 0.26, 0.22, 0.1];

export const TOTAL_DAYS = 180;

function generate(): Day[] {
  const rnd = mulberry32(20261105);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const days: Day[] = [];
  for (let i = 0; i < TOTAL_DAYS; i++) {
    const date = new Date(end);
    date.setDate(end.getDate() - (TOTAL_DAYS - 1 - i));
    const wd = (date.getDay() + 6) % 7; // Пн = 0
    const promo = rnd() < 0.05 ? 1.25 : 1;
    const revenue = Math.round((11000 + i * 22) * WEEKDAY_FACTOR[wd] * (0.9 + rnd() * 0.2) * promo);
    const orders = Math.round(revenue / (82 + rnd() * 14));
    const visitors = Math.round(orders / (0.026 + rnd() * 0.007));

    const raw = SHARES.map((s) => s * (0.75 + rnd() * 0.5));
    const sum = raw.reduce((a, b) => a + b, 0);
    const byChannel = raw.map((v) => Math.round((v / sum) * revenue));

    const profile = wd >= 5 ? WEEKEND_PROFILE : WEEKDAY_PROFILE;
    const braw = profile.map((p) => p * (0.8 + rnd() * 0.4));
    const bsum = braw.reduce((a, b) => a + b, 0);
    const byBlock = braw.map((v) => Math.round((v / bsum) * orders));

    days.push({ date, revenue, orders, visitors, byChannel, byBlock });
  }
  return days;
}

export const ALL_DAYS = generate();

export interface DashboardData {
  range: number;
  current: Day[];
  previous: Day[];
}

export const RANGES = [7, 14, 30, 90] as const;

export function sliceRange(range: number): DashboardData {
  return {
    range,
    current: ALL_DAYS.slice(-range),
    previous: ALL_DAYS.slice(-2 * range, -range),
  };
}

export const sum = (days: Day[], pick: (d: Day) => number) => days.reduce((a, d) => a + pick(d), 0);

export interface Order {
  id: string;
  customer: string;
  channel: string;
  amount: number;
  status: 'paid' | 'pending' | 'refunded';
}

export const RECENT_ORDERS: Order[] = [
  { id: '#48213', customer: 'Анна Белова', channel: 'E-mail', amount: 8450, status: 'paid' },
  { id: '#48212', customer: 'Илья Громов', channel: 'Органический поиск', amount: 12990, status: 'paid' },
  { id: '#48211', customer: 'ООО «Вектор»', channel: 'Партнёры', amount: 64200, status: 'pending' },
  { id: '#48210', customer: 'Мария Орлова', channel: 'Соцсети', amount: 3790, status: 'paid' },
  { id: '#48209', customer: 'Денис Ким', channel: 'Платная реклама', amount: 15600, status: 'refunded' },
  { id: '#48208', customer: 'Ольга Жукова', channel: 'Прямые заходы', amount: 7120, status: 'paid' },
  { id: '#48207', customer: 'Пётр Лисицын', channel: 'Платная реклама', amount: 9980, status: 'pending' },
  { id: '#48206', customer: 'Елена Седова', channel: 'Органический поиск', amount: 22300, status: 'paid' },
];
