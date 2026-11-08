// Deterministic mock data. Swap `buildDataset` for a real API call; widgets only read `Dataset`.

export type RangeKey = '7' | '30' | '90';

export const RANGES: { value: RangeKey; content: string }[] = [
  { value: '7', content: 'Последние 7 дней' },
  { value: '30', content: 'Последние 30 дней' },
  { value: '90', content: 'Последние 90 дней' },
];

export interface Series {
  current: number[];
  previous: number[];
}

export interface Dataset {
  range: RangeKey;
  /** Dates of the current period, one per point of `Series.current`. */
  days: Date[];
  /** Dates of the previous period, aligned by index with `days`. */
  prevDays: Date[];
  revenue: Series;
  users: Series;
  conversion: Series;
  latency: Series;
  channels: { id: string; name: string; value: number }[];
  traffic: { id: string; name: string; value: number }[];
  pages: { path: string; views: number; bounce: number }[];
  plan: { done: number; target: number };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const WEEKDAY = [0.82, 1.02, 1.06, 1.08, 1.04, 0.98, 0.86]; // Sun..Sat

/** One continuous run of 2n days: first half = previous period, second half = current. */
function makeSeries(seed: number, n: number, base: number, growth: number, noise: number, days: Date[], prev: Date[]): Series {
  const rand = rng(seed + n * 101);
  const dates = [...prev, ...days];
  const all = dates.map((d, i) => {
    const trend = 1 + growth * (i / (2 * n - 1) - 0.5);
    const wave = 1 + 0.05 * Math.sin(i / 3.1);
    return base * trend * wave * WEEKDAY[d.getDay()] * (1 + (rand() - 0.5) * noise);
  });
  return { previous: all.slice(0, n), current: all.slice(n) };
}

export function buildDataset(range: RangeKey, today = new Date()): Dataset {
  const n = Number(range);
  const day = (offset: number) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    d.setDate(d.getDate() - offset);
    return d;
  };
  const days = Array.from({ length: n }, (_, i) => day(n - 1 - i));
  const prevDays = Array.from({ length: n }, (_, i) => day(2 * n - 1 - i));

  const revenue = makeSeries(11, n, 420_000, 0.16, 0.14, days, prevDays);
  const users = makeSeries(23, n, 8_200, 0.1, 0.08, days, prevDays);
  const conversion = makeSeries(37, n, 3.4, 0.06, 0.1, days, prevDays);
  const latency = makeSeries(51, n, 280, -0.12, 0.12, days, prevDays);

  const scale = n / 30;
  const jitter = (seed: number) => 1 + (rng(seed + n)() - 0.5) * 0.08;
  const channels = [
    ['search', 'Поиск', 4210],
    ['direct', 'Прямые заходы', 3180],
    ['ads', 'Реклама', 2760],
    ['social', 'Соцсети', 1540],
    ['email', 'Почта', 1220],
    ['partners', 'Партнёры', 640],
  ].map(([id, name, v], i) => ({ id: id as string, name: name as string, value: Math.round((v as number) * scale * jitter(i + 1)) }));

  const visits = 38_000 * n;
  const traffic = [
    ['organic', 'Органика', 0.46],
    ['direct', 'Прямой', 0.22],
    ['ads', 'Реклама', 0.17],
    ['social', 'Соцсети', 0.09],
    ['referral', 'Рефералы', 0.06],
  ].map(([id, name, share]) => ({ id: id as string, name: name as string, value: Math.round(visits * (share as number)) }));

  const pages = [
    ['/', 184_000, 31],
    ['/catalog', 121_500, 38],
    ['/catalog/smartphones', 88_200, 44],
    ['/cart', 41_900, 27],
    ['/checkout', 30_600, 36],
    ['/blog/how-to-choose', 22_400, 63],
    ['/promo/autumn-sale', 18_700, 58],
  ].map(([path, views, bounce], i) => ({
    path: path as string,
    views: Math.round((views as number) * scale * jitter(i + 20)),
    bounce: bounce as number,
  }));

  const total = revenue.current.reduce((a, b) => a + b, 0);
  return { range, days, prevDays, revenue, users, conversion, latency, channels, traffic, pages, plan: { done: total, target: total * 1.18 } };
}

export const sum = (v: number[]) => v.reduce((a, b) => a + b, 0);
export const avg = (v: number[]) => (v.length ? sum(v) / v.length : 0);

/** Relative change of the current period against the previous one, in percent. */
export const deltaPct = (cur: number, prev: number) => (prev === 0 ? 0 : ((cur - prev) / prev) * 100);

/** Reduce a series to at most `points` bucket averages (for sparklines). */
export function downsample(values: number[], points = 12): number[] {
  if (values.length <= points) return values;
  return Array.from({ length: points }, (_, i) => {
    const from = Math.floor((i * values.length) / points);
    const to = Math.max(from + 1, Math.floor(((i + 1) * values.length) / points));
    return avg(values.slice(from, to));
  });
}
