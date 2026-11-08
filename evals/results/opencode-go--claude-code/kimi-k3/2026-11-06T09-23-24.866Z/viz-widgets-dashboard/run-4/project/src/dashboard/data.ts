import type {MetricKey} from './types';

/* ---------- deterministic pseudo-random data ---------- */

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface SeriesOpts {
  base: number;
  trend: number;
  amp: number;
  noise: number;
  min: number;
  max: number;
}

const METRIC_OPTS: Record<MetricKey, SeriesOpts> = {
  revenue: {base: 820_000, trend: 2_400, amp: 150_000, noise: 55_000, min: 200_000, max: 2_000_000},
  users: {base: 12_400, trend: 28, amp: 1_700, noise: 800, min: 3_000, max: 40_000},
  conv: {base: 3.1, trend: 0.004, amp: 0.35, noise: 0.22, min: 0.6, max: 8},
  churn: {base: 2.3, trend: -0.003, amp: 0.28, noise: 0.18, min: 0.4, max: 6},
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Fixed window behind every metric, so ranges slice one stable timeline. */
const HISTORY_DAYS = 180;

function fullSeries(metric: MetricKey): number[] {
  const o = METRIC_OPTS[metric];
  const rand = mulberry32(hashStr(`metric:${metric}`));
  const phase = rand() * Math.PI * 2;
  const out: number[] = [];
  for (let i = 0; i < HISTORY_DAYS; i++) {
    const seasonal = o.amp * Math.sin((i / 7) * Math.PI * 2 + phase);
    const noise = (rand() * 2 - 1) * o.noise;
    out.push(clamp(o.base + o.trend * i + seasonal + noise, o.min, o.max));
  }
  return out;
}

/**
 * Daily values for a metric. The sequence is stable per metric key:
 * a shorter range returns the *last* `days` of the same long series,
 * so widgets always agree with each other.
 */
export function dailySeries(metric: MetricKey, days: number): number[] {
  return fullSeries(metric).slice(-days);
}

/** The equal-length window right before the current one. */
export function previousSeries(metric: MetricKey, days: number): number[] {
  return fullSeries(metric).slice(-days * 2, -days);
}

export interface KpiData {
  value: number;
  /** signed fraction vs previous period, e.g. 0.124 */
  delta: number;
  spark: number[];
  upIsGood: boolean;
}

export function kpiData(metric: MetricKey, days: number): KpiData {
  const cur = dailySeries(metric, days);
  const prev = previousSeries(metric, days);
  const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
  const avg = (a: number[]) => sum(a) / a.length;

  let value: number;
  let prevValue: number;
  if (metric === 'revenue') {
    value = sum(cur);
    prevValue = sum(prev);
  } else {
    value = avg(cur);
    prevValue = avg(prev);
  }
  return {
    value,
    delta: prevValue === 0 ? 0 : (value - prevValue) / prevValue,
    spark: cur.slice(-12),
    upIsGood: metric !== 'churn',
  };
}

export interface CategorySales {
  name: string;
  value: number;
}

const CATEGORIES = ['Электроника', 'Одежда', 'Дом и сад', 'Спорт', 'Красота', 'Книги'];
const CATEGORY_BASE = [96_000, 61_000, 48_000, 39_000, 27_000, 18_000];

export function categorySales(days: number): CategorySales[] {
  const rand = mulberry32(hashStr(`categories:${days}`));
  return CATEGORIES.map((name, i) => ({
    name,
    value: Math.round(CATEGORY_BASE[i] * days * (0.92 + rand() * 0.16)),
  }));
}

export interface ChannelShare {
  name: string;
  share: number;
  value: number;
}

const CHANNELS: Array<{name: string; base: number}> = [
  {name: 'Онлайн', base: 0.46},
  {name: 'Розница', base: 0.27},
  {name: 'Партнёры', base: 0.17},
  {name: 'Опт', base: 0.1},
];

export function channelShares(days: number): ChannelShare[] {
  const rand = mulberry32(hashStr(`channels:${days}`));
  const raw = CHANNELS.map((c) => c.base * (0.94 + rand() * 0.12));
  const totalShare = raw.reduce((s, v) => s + v, 0);
  const revenueTotal = dailySeries('revenue', days).reduce((s, v) => s + v, 0);
  return CHANNELS.map((c, i) => {
    const share = raw[i] / totalShare;
    return {name: c.name, share, value: Math.round(revenueTotal * share)};
  });
}

/* ---------- dates ---------- */

const dateFmt = new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short'});

export function dateLabels(days: number, end = new Date()): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    out.push(dateFmt.format(d));
  }
  return out;
}

/* ---------- formatting ---------- */

const full = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
const compact = new Intl.NumberFormat('ru-RU', {notation: 'compact', maximumFractionDigits: 1});

/** Axis style: in full under 10 000, compact above. */
export function fmtAxis(v: number): string {
  return Math.abs(v) < 10_000 ? full.format(v) : compact.format(v);
}

export function fmtMoney(v: number): string {
  return `${compact.format(v)} ₽`;
}

export function fmtInt(v: number): string {
  return compact.format(v);
}

export function fmtPct(v: number, digits = 1): string {
  return `${v.toFixed(digits).replace('.', ',')} %`;
}

export function fmtSignedPct(frac: number): string {
  const p = frac * 100;
  const sign = p > 0 ? '+' : p < 0 ? '−' : '';
  return `${sign}${Math.abs(p).toFixed(1).replace('.', ',')} %`;
}

/* ---------- scales ---------- */

export function niceScale(
  min: number,
  max: number,
  count = 4,
): {lo: number; hi: number; ticks: number[]} {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const norm = step0 / mag;
  const step = (norm >= 5 ? 10 : norm >= 2.2 ? 5 : norm >= 1.2 ? 2 : 1) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step * 1e-9; v += step) ticks.push(v);
  return {lo, hi, ticks};
}
