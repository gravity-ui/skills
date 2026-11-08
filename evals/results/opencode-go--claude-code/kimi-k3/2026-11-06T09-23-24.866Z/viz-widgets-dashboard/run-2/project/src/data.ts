import { compact, money } from './format';

export type RangeKey = '7' | '30' | '90';

/* Deterministic PRNG so the dashboard is stable across reloads. */
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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtDate(d: Date): string {
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

export interface Daily {
  date: Date;
  label: string;
  pageViews: number;
  uniques: number;
  revenue: number;
  users: number;
  conv: number;
  err: number;
  basic: number;
  pro: number;
  business: number;
}

const TOTAL_DAYS = 200;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const DAILY: Daily[] = (() => {
  const rand = mulberry32(20261106);
  const today = new Date(2026, 10, 6);
  const out: Daily[] = [];
  for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const t = TOTAL_DAYS - i;
    const dow = date.getDay();
    const weekend = dow === 0 || dow === 6 ? 0.72 : 1;
    const trend = 1 + t * 0.0012;
    const pageViews = Math.round(11500 * weekend * trend * (0.9 + rand() * 0.25));
    const uniques = Math.round(pageViews * (0.4 + rand() * 0.06));
    const users = Math.round(8200 * weekend * trend * (0.92 + rand() * 0.16));
    const conv = clamp(0.034 + (rand() - 0.5) * 0.008 + t * 0.00002, 0.015, 0.06);
    const err = clamp(0.0042 + (rand() - 0.5) * 0.003 - t * 0.000004, 0.0008, 0.015);
    const revenue = Math.round(users * conv * (38 + rand() * 8));
    const basic = Math.round(210 * weekend * trend * (0.85 + rand() * 0.3));
    const pro = Math.round(120 * weekend * trend * (0.85 + rand() * 0.3));
    const business = Math.round(46 * trend * (0.85 + rand() * 0.3));
    out.push({ date, label: fmtDate(date), pageViews, uniques, revenue, users, conv, err, basic, pro, business });
  }
  return out;
})();

const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
const avg = (a: number[]) => (a.length ? sum(a) / a.length : 0);

function bucketize(days: Daily[], size: number): Daily[][] {
  const out: Daily[][] = [];
  for (let i = 0; i < days.length; i += size) out.push(days.slice(i, i + size));
  return out;
}

function sparkSeries(values: number[]): number[] {
  const n = 12;
  const size = Math.max(1, Math.floor(values.length / n));
  const out: number[] = [];
  for (let i = 0; i + size <= values.length && out.length < n; i += size) {
    out.push(avg(values.slice(i, i + size)));
  }
  while (out.length < n && values.length) out.push(values[values.length - 1]);
  return out;
}

export interface KpiData {
  value: number;
  delta: number;
  spark: number[];
  upIsGood: boolean;
  format: (n: number) => string;
}

export interface NamedSeries {
  name: string;
  values: number[];
}

export interface DashboardData {
  days: number;
  rangeLabel: string;
  kpis: { id: string; label: string; kpi: KpiData }[];
  traffic: { labels: string[]; series: NamedSeries[] };
  signups: { labels: string[]; ranges: string[]; series: NamedSeries[] };
  channels: { name: string; value: number }[];
  sources: { name: string; value: number }[];
  capacity: { used: number; total: number };
}

const CHANNELS: [string, number][] = [
  ['Organic search', 1620],
  ['Direct', 1080],
  ['Paid', 940],
  ['Referral', 430],
  ['Social', 320],
  ['Email', 240],
];

const SOURCES: [string, number][] = [
  ['Organic', 0.38],
  ['Paid', 0.22],
  ['Referral', 0.14],
  ['Social', 0.09],
  ['Email', 0.07],
  ['Other', 0.1],
];

export function getDashboardData(range: RangeKey): DashboardData {
  const days = Number(range);
  const cur = DAILY.slice(DAILY.length - days);
  const prev = DAILY.slice(DAILY.length - days * 2, DAILY.length - days);

  const pick = (get: (d: Daily) => number, agg: (a: number[]) => number) => ({
    c: agg(cur.map(get)),
    p: agg(prev.map(get)),
    spark: sparkSeries(cur.map(get)),
  });

  const metric = (
    get: (d: Daily) => number,
    agg: (a: number[]) => number,
    format: (n: number) => string,
    upIsGood: boolean,
  ): KpiData => {
    const { c, p, spark } = pick(get, agg);
    return { value: c, delta: p === 0 ? 0 : (c - p) / p, spark, upIsGood, format };
  };

  const kpis = [
    { id: 'revenue', label: 'Revenue', kpi: metric((d) => d.revenue, sum, money, true) },
    { id: 'users', label: 'Active users', kpi: metric((d) => d.users, avg, compact, true) },
    { id: 'conv', label: 'Conversion', kpi: metric((d) => d.conv, avg, (v) => (v * 100).toFixed(2) + '%', true) },
    { id: 'err', label: 'Error rate', kpi: metric((d) => d.err, avg, (v) => (v * 100).toFixed(2) + '%', false) },
  ];

  /* Traffic: daily up to 31 days, weekly buckets beyond. */
  const tBuckets = bucketize(cur, days <= 31 ? 1 : 7);
  const traffic = {
    labels: tBuckets.map((b) => b[b.length - 1].label),
    series: [
      { name: 'Page views', values: tBuckets.map((b) => Math.round(avg(b.map((d) => d.pageViews)))) },
      { name: 'Unique visitors', values: tBuckets.map((b) => Math.round(avg(b.map((d) => d.uniques)))) },
    ],
  };

  /* Signups: ~8 columns regardless of range. Axis labels stay short (bucket end);
     the full range string goes to the table view. */
  const sSize = Math.max(1, Math.ceil(days / 8));
  const sBuckets = bucketize(cur, sSize);
  const sRange = (b: Daily[]) =>
    sSize === 1 ? b[0].label : `${b[0].label} – ${b[b.length - 1].label}`;
  const signups = {
    labels: sBuckets.map((b) => b[b.length - 1].label),
    ranges: sBuckets.map(sRange),
    series: [
      { name: 'Basic', values: sBuckets.map((b) => sum(b.map((d) => d.basic))) },
      { name: 'Pro', values: sBuckets.map((b) => sum(b.map((d) => d.pro))) },
      { name: 'Business', values: sBuckets.map((b) => sum(b.map((d) => d.business))) },
    ],
  };

  const rand = mulberry32(777);
  const channels = CHANNELS.map(([name, perDay]) => ({
    name,
    value: Math.round(perDay * days * (0.94 + rand() * 0.12)),
  })).sort((a, b) => b.value - a.value);

  const totalSessions = sum(cur.map((d) => d.uniques));
  const sources = SOURCES.map(([name, share]) => ({ name, value: Math.round(totalSessions * share) }));

  return {
    days,
    rangeLabel: `${days} days`,
    kpis,
    traffic,
    signups,
    channels,
    sources,
    capacity: { used: 613, total: 960 },
  };
}
