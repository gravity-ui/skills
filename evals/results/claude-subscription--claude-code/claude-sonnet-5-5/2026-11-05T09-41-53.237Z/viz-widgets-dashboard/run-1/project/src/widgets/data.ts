// Deterministic demo data, so the dashboard looks the same on every load.

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DAY = 24 * 3600 * 1000;

export interface DayPoint {
  date: Date;
  current: number;
  previous: number;
}

function buildTraffic(days: number): DayPoint[] {
  const rand = rng(7);
  const end = new Date();
  end.setHours(0, 0, 0, 0);
  const series = (base: number, growth: number) =>
    Array.from({ length: days }, (_, i) => {
      const weekly = Math.sin((i / 7) * Math.PI * 2 - 1) * 380;
      return Math.round(base + growth * i + weekly + (rand() - 0.5) * 420);
    });
  const current = series(4300, 38);
  const previous = series(3800, 24);
  return current.map((value, i) => ({
    date: new Date(end.getTime() - (days - 1 - i) * DAY),
    current: value,
    previous: previous[i],
  }));
}

export const traffic = buildTraffic(30);

export const sparklines = {
  revenue: [41, 44, 43, 48, 47, 52, 50, 55, 58, 57, 63, 66],
  orders: [30, 34, 33, 31, 36, 38, 37, 41, 40, 43, 42, 46],
  conversion: [4.4, 4.3, 4.3, 4.1, 4.2, 4.0, 4.1, 3.9, 3.9, 3.8, 3.9, 3.8],
};

export const channels = [
  { name: 'Органический поиск', value: 482_000 },
  { name: 'Прямые заходы', value: 311_500 },
  { name: 'Контекстная реклама', value: 254_300 },
  { name: 'Рассылки', value: 148_700 },
  { name: 'Соцсети', value: 87_900 },
];

export const quarterGoal = { value: 3_840_000, target: 5_300_000 };

export type OrderStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export const orders: { id: string; customer: string; amount: number; status: OrderStatus }[] = [
  { id: '#10482', customer: 'Анна Морозова', amount: 12_490, status: 'paid' },
  { id: '#10481', customer: 'Игорь Левин', amount: 3_200, status: 'pending' },
  { id: '#10480', customer: 'ООО «Северный ветер»', amount: 148_000, status: 'paid' },
  { id: '#10479', customer: 'Мария Орлова', amount: 7_850, status: 'refunded' },
  { id: '#10478', customer: 'Денис Ким', amount: 990, status: 'failed' },
  { id: '#10477', customer: 'Елена Громова', amount: 21_300, status: 'paid' },
  { id: '#10476', customer: 'Павел Седов', amount: 5_600, status: 'pending' },
];

export const fmtInt = new Intl.NumberFormat('ru-RU');
export const fmtRub = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
export const fmtCompact = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
export const fmtDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });
export const fmtDateLong = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});
