/**
 * Демо-данные. Детерминированы: значение за конкретный день не зависит от выбранного
 * периода, поэтому 7 дней — это ровно хвост 30 и 90 дней, и цифры на всех виджетах сходятся.
 */
const DAY = 86_400_000;

const dayNumber = (d: Date) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
const TODAY = dayNumber(new Date());

function hash(a: number, b: number): number {
  let h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x7f4a7c15, 0xc2b2ae35);
  h ^= h >>> 15;
  h = Math.imul(h, 0x2c1b3c6d);
  h ^= h >>> 12;
  h = Math.imul(h, 0x297a2d39);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

const isWeekend = (day: number) => {
  const wd = new Date(day * DAY).getUTCDay();
  return wd === 0 || wd === 6;
};

/** Номера дней окна: последние `days` дней, смещённые на `back` дней назад. */
export function windowDays(days: number, back = 0): number[] {
  const end = TODAY - back;
  return Array.from({ length: days }, (_, i) => end - days + 1 + i);
}

export const dayToDate = (day: number) => new Date(day * DAY + 12 * 3_600_000);

// --- Трафик по каналам ---
export const CHANNELS = [
  { id: 'organic', name: 'Органика', base: 5200, weekend: 0.8 },
  { id: 'direct', name: 'Прямой', base: 3100, weekend: 0.85 },
  { id: 'paid', name: 'Реклама', base: 2300, weekend: 0.95 },
] as const;

export type ChannelId = (typeof CHANNELS)[number]['id'];

function channelVisits(ci: number, day: number): number {
  const c = CHANNELS[ci];
  const season = 1 + 0.12 * Math.sin(day / 17 + ci * 2);
  const week = isWeekend(day) ? c.weekend : 1;
  const noise = 0.9 + 0.2 * hash(day, ci + 1);
  return Math.round(c.base * season * week * noise);
}

export const visitsOn = (day: number) => CHANNELS.reduce((sum, _, ci) => sum + channelVisits(ci, day), 0);

export function trafficByChannel(days: number) {
  const ds = windowDays(days);
  return {
    dates: ds.map(dayToDate),
    series: CHANNELS.map((c, ci) => ({
      id: c.id,
      name: c.name,
      values: ds.map((d) => channelVisits(ci, d)),
    })),
  };
}

// --- KPI ---
export type KpiId = 'visitors' | 'revenue' | 'conversion' | 'errors';

const conversionOn = (day: number) => 0.028 * (isWeekend(day) ? 0.9 : 1) * (1 + 0.3 * (hash(day, 11) - 0.5));
const orderValueOn = (day: number) => 2400 * (1 + 0.2 * (hash(day, 12) - 0.5));
const errorRateOn = (day: number) => 0.006 * (1 + 0.8 * (hash(day, 13) - 0.4));

const DAILY: Record<KpiId, (day: number) => number> = {
  visitors: visitsOn,
  revenue: (d) => visitsOn(d) * conversionOn(d) * orderValueOn(d),
  conversion: (d) => conversionOn(d) * 100,
  errors: (d) => errorRateOn(d) * 100,
};

/** Суммируем накопительные метрики, усредняем относительные. */
const SUMMED: Record<KpiId, boolean> = { visitors: true, revenue: true, conversion: false, errors: false };

const aggregate = (id: KpiId, xs: number[]) =>
  xs.reduce((a, b) => a + b, 0) / (SUMMED[id] ? 1 : xs.length);

/** Делит ряд на `k` почти равных корзин и усредняет каждую. */
function bucket(xs: number[], k: number): number[] {
  const n = Math.min(k, xs.length);
  return Array.from({ length: n }, (_, i) => {
    const from = Math.floor((i * xs.length) / n);
    const to = Math.floor(((i + 1) * xs.length) / n);
    const part = xs.slice(from, to);
    return part.reduce((a, b) => a + b, 0) / part.length;
  });
}

export function kpi(id: KpiId, days: number) {
  const f = DAILY[id];
  const current = windowDays(days).map(f);
  const previous = windowDays(days, days).map(f);
  const value = aggregate(id, current);
  const before = aggregate(id, previous);
  return {
    value,
    delta: before === 0 ? 0 : (value - before) / before,
    // 6 точек прошлого периода + 6 текущего
    trailing: bucket(previous, 6),
    trend: bucket(current, 6),
  };
}

// --- Страницы ---
const PAGES = [
  { path: '/', base: 4100 },
  { path: '/catalog', base: 3400 },
  { path: '/pricing', base: 2300 },
  { path: '/blog/release-notes', base: 1700 },
  { path: '/docs/getting-started', base: 1500 },
  { path: '/checkout', base: 1150 },
  { path: '/account/orders', base: 900 },
  { path: '/support', base: 720 },
  { path: '/about', base: 430 },
];

export function topPages(days: number) {
  const ds = windowDays(days);
  return PAGES.map((p, i) => ({
    path: p.path,
    views: Math.round(ds.reduce((s, d) => s + p.base * (0.85 + 0.3 * hash(d, 100 + i)), 0)),
  })).sort((a, b) => b.views - a.views);
}

// --- Устройства ---
const DEVICES = [
  { id: 'desktop', name: 'Десктоп', w: 0.46 },
  { id: 'mobile', name: 'Смартфоны', w: 0.43 },
  { id: 'tablet', name: 'Планшеты', w: 0.08 },
  { id: 'other', name: 'Другое', w: 0.03 },
];

export function deviceSplit(days: number) {
  const totals = DEVICES.map(() => 0);
  for (const d of windowDays(days)) {
    const raw = DEVICES.map((dev, i) => dev.w * (0.92 + 0.16 * hash(d, 200 + i)));
    const sum = raw.reduce((a, b) => a + b, 0);
    const visits = visitsOn(d);
    raw.forEach((r, i) => (totals[i] += (visits * r) / sum));
  }
  const total = totals.reduce((a, b) => a + b, 0);
  return {
    total,
    parts: DEVICES.map((dev, i) => ({
      id: dev.id,
      name: dev.name,
      value: Math.round(totals[i]),
      share: totals[i] / total,
    })),
  };
}

// --- Нагрузка (состояние «сейчас», от периода не зависит) ---
export const SERVICE_LOAD = [
  { id: 'api', name: 'API-шлюз', value: 0.62 },
  { id: 'db', name: 'База данных', value: 0.78 },
  { id: 'disk', name: 'Диск логов', value: 0.93 },
  { id: 'queue', name: 'Очередь задач', value: 0.41 },
];

// --- События ---
export type Severity = 'good' | 'warning' | 'serious' | 'critical';

const INCIDENTS: { daysAgo: number; service: string; title: string; status: Severity }[] = [
  { daysAgo: 0, service: 'Диск логов', title: 'Заполнено 93% тома', status: 'critical' },
  { daysAgo: 1, service: 'База данных', title: 'Рост времени ответа запросов', status: 'serious' },
  { daysAgo: 2, service: 'Платежи', title: 'Единичные таймауты эквайринга', status: 'warning' },
  { daysAgo: 4, service: 'API-шлюз', title: 'Всплеск ошибок 502', status: 'good' },
  { daysAgo: 9, service: 'CDN', title: 'Недоступен узел в Новосибирске', status: 'good' },
  { daysAgo: 17, service: 'Поиск', title: 'Устаревший индекс каталога', status: 'good' },
  { daysAgo: 31, service: 'Авторизация', title: 'Сбой отправки SMS-кодов', status: 'good' },
  { daysAgo: 58, service: 'Очередь задач', title: 'Накопление необработанных задач', status: 'good' },
];

export function incidents(days: number) {
  return INCIDENTS.filter((i) => i.daysAgo < days).map((i) => ({
    ...i,
    date: dayToDate(TODAY - i.daysAgo),
  }));
}
