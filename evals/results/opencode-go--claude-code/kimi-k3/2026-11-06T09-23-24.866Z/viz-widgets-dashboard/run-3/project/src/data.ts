// Deterministic demo dataset (seeded PRNG so re-renders never flicker).

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface DayPoint {
  day: number; // 0..29, день периода
  label: string; // подпись даты
  value: number;
}

const DAY_COUNT = 30;

function makeSeries(seed: number, base: number, amp: number, drift: number): DayPoint[] {
  const rnd = mulberry32(seed);
  const out: DayPoint[] = [];
  const start = new Date(2026, 9, 8); // 30 дней до 06.11.2026
  for (let i = 0; i < DAY_COUNT; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const weekly = Math.sin((i / 7) * Math.PI * 2) * amp * 0.6;
    const noise = (rnd() - 0.5) * amp;
    const value = Math.round(base + drift * i + weekly + noise);
    out.push({
      day: i,
      label: d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      value: Math.max(0, value),
    });
  }
  return out;
}

/** Выручка: этот год vs прошлый (одна единица — тыс. ₽, одна ось). */
export const revenueNow = makeSeries(11, 420, 90, 3.2);
export const revenuePrev = makeSeries(7, 350, 70, 1.1);

export interface BarItem {
  name: string;
  value: number;
}

const categorySeed = mulberry32(42);
export const categories: BarItem[] = [
  ['Электроника', 1240],
  ['Одежда', 980],
  ['Дом и сад', 760],
  ['Спорт', 540],
  ['Книги', 410],
  ['Красота', 330],
].map(([name, v]) => ({
  name: String(name),
  value: Math.round(Number(v) * (0.9 + categorySeed() * 0.2)),
}));

const sourceSeed = mulberry32(5);
const sourceRaw = [46, 27, 12, 9, 6].map((v) => v * (0.85 + sourceSeed() * 0.3));
const sourceTotal = sourceRaw.reduce((a, b) => a + b, 0);
export const sources: BarItem[] = ['Прямые', 'Поиск', 'Соцсети', 'Почта', 'Прочее'].map(
  (name, i) => ({ name, value: Math.round((sourceRaw[i] / sourceTotal) * 1000) / 10 }),
);

export interface StatDef {
  id: string;
  label: string;
  value: number;
  delta: number; // % к прошлому периоду
  upIsGood: boolean;
  format: 'money' | 'count' | 'percent';
  spark: number[]; // 12 точек
}

function spark(seed: number, n: number, base: number): number[] {
  const rnd = mulberry32(seed);
  return Array.from({ length: n }, (_, i) =>
    Math.max(0, Math.round(base + i * base * 0.02 + (rnd() - 0.5) * base * 0.4)),
  );
}

export const stats: StatDef[] = [
  {
    id: 'revenue',
    label: 'Выручка',
    value: 4_210_000,
    delta: 12.4,
    upIsGood: true,
    format: 'money',
    spark: spark(21, 12, 100),
  },
  {
    id: 'orders',
    label: 'Заказы',
    value: 12_940,
    delta: 3.1,
    upIsGood: true,
    format: 'count',
    spark: spark(33, 12, 80),
  },
  {
    id: 'returns',
    label: 'Возвраты',
    value: 2.8,
    delta: 0.6,
    upIsGood: false,
    format: 'percent',
    spark: spark(55, 12, 40),
  },
];

export interface PageRow {
  page: string;
  views: number;
  change: number; // %
}

const pageSeed = mulberry32(99);
export const topPages: PageRow[] = [
  ['/catalog/elektronika', 48_120],
  ['/actions/black-friday', 39_870],
  ['/catalog/odezhda', 31_540],
  ['/dostavka', 18_230],
  ['/catalog/dom-i-sad', 15_910],
  ['/podderzhka', 12_400],
  ['/catalog/sport', 11_050],
  ['/o-kompanii', 8_730],
].map(([page, views]) => ({
  page: String(page),
  views: Number(views),
  change: Math.round((pageSeed() * 40 - 15) * 10) / 10,
}));

export function formatValue(v: number, format: StatDef['format']): string {
  if (format === 'money') {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1).replace('.', ',')} млн ₽`;
    return `${Math.round(v / 1000)} тыс. ₽`;
  }
  if (format === 'percent') return `${String(v).replace('.', ',')}%`;
  return v >= 10_000 ? `${(v / 1000).toFixed(1).replace('.', ',')}K` : String(v);
}

export function formatNumber(v: number): string {
  return new Intl.NumberFormat('ru-RU').format(v);
}
