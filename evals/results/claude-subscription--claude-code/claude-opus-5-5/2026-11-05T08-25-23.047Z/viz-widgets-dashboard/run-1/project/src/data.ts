/** Deterministic demo data. Same range → same numbers, so the dashboard is stable across reloads. */

export type RangeKey = '7d' | '30d' | '90d';

export const RANGES: { value: RangeKey; label: string; days: number }[] = [
    { value: '7d', label: '7 дней', days: 7 },
    { value: '30d', label: '30 дней', days: 30 },
    { value: '90d', label: '90 дней', days: 90 },
];

export interface DayPoint {
    date: Date;
    revenue: number;
    prevRevenue: number;
    orders: number;
    prevOrders: number;
    visits: number;
    prevVisits: number;
}

export interface Kpi {
    value: number;
    prev: number;
    trend: number[];
}

export interface DashboardData {
    days: DayPoint[];
    kpi: { revenue: Kpi; orders: Kpi; conversion: Kpi; aov: Kpi };
    channels: { name: string; revenue: number }[];
    devices: { name: string; visits: number }[];
    products: { name: string; category: string; orders: number; revenue: number; delta: number }[];
    goal: { target: number; actual: number; elapsedShare: number };
}

function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const TODAY = new Date(2026, 10, 5);

function bucket(values: number[], buckets: number): number[] {
    if (values.length <= buckets) return values;
    const size = values.length / buckets;
    return Array.from({ length: buckets }, (_, b) => {
        const slice = values.slice(Math.round(b * size), Math.round((b + 1) * size));
        return slice.reduce((s, v) => s + v, 0) / slice.length;
    });
}

const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0);

export function getDashboardData(range: RangeKey): DashboardData {
    const days = RANGES.find((r) => r.value === range)!.days;
    const rnd = mulberry32(days * 7919);

    const points: DayPoint[] = Array.from({ length: days }, (_, k) => {
        const date = new Date(TODAY);
        date.setDate(TODAY.getDate() - (days - 1 - k));
        const weekly = 1 + 0.18 * Math.sin(((date.getDay() + 1) / 7) * Math.PI * 2);
        const growth = 1 + (k / days) * 0.12;
        const visits = Math.round(4200 * weekly * growth * (0.9 + rnd() * 0.2));
        const prevVisits = Math.round(4000 * weekly * (0.9 + rnd() * 0.2));
        const orders = Math.round(visits * (0.031 + rnd() * 0.006));
        const prevOrders = Math.round(prevVisits * (0.029 + rnd() * 0.006));
        return {
            date,
            visits,
            prevVisits,
            orders,
            prevOrders,
            revenue: Math.round(orders * (2350 + rnd() * 300)),
            prevRevenue: Math.round(prevOrders * (2300 + rnd() * 300)),
        };
    });

    const pick = (key: keyof Omit<DayPoint, 'date'>) => points.map((p) => p[key]);
    const revenue = sum(pick('revenue'));
    const prevRevenue = sum(pick('prevRevenue'));
    const orders = sum(pick('orders'));
    const prevOrders = sum(pick('prevOrders'));
    const visits = sum(pick('visits'));
    const prevVisits = sum(pick('prevVisits'));

    const trendOf = (fn: (p: DayPoint) => number) => bucket(points.map(fn), 12);

    const channelShares: [string, number][] = [
        ['Органический поиск', 0.34],
        ['Контекстная реклама', 0.27],
        ['Email-рассылки', 0.16],
        ['Соцсети', 0.13],
        ['Партнёры', 0.1],
    ];
    const channels = channelShares
        .map(([name, share]) => ({ name, revenue: Math.round(revenue * share * (0.85 + rnd() * 0.3)) }))
        .sort((a, b) => b.revenue - a.revenue);

    const devices = [
        { name: 'Мобильные', visits: Math.round(visits * 0.58) },
        { name: 'Десктоп', visits: Math.round(visits * 0.35) },
        { name: 'Планшеты', visits: 0 },
    ];
    devices[2].visits = visits - devices[0].visits - devices[1].visits;

    const productNames: [string, string][] = [
        ['Беспроводные наушники', 'Электроника'],
        ['Кофемашина капсульная', 'Техника для дома'],
        ['Рюкзак городской', 'Аксессуары'],
        ['Умные часы', 'Электроника'],
        ['Набор посуды', 'Дом и кухня'],
        ['Настольная лампа', 'Дом и кухня'],
        ['Портативная колонка', 'Электроника'],
        ['Термокружка', 'Аксессуары'],
    ];
    const products = productNames
        .map(([name, category], k) => {
            const productOrders = Math.round(orders * (0.12 - k * 0.011) * (0.9 + rnd() * 0.2));
            return {
                name,
                category,
                orders: productOrders,
                revenue: Math.round(productOrders * (1500 + rnd() * 6000)),
                delta: Math.round((rnd() - 0.35) * 400) / 10,
            };
        })
        .sort((a, b) => b.revenue - a.revenue);

    // Monthly plan: November so far.
    const monthDays = 30;
    const elapsed = TODAY.getDate();
    const monthToDate = sum(points.slice(-elapsed).map((p) => p.revenue));
    const target = Math.round((revenue / days) * monthDays * 1.08 / 100000) * 100000;

    return {
        days: points,
        kpi: {
            revenue: { value: revenue, prev: prevRevenue, trend: trendOf((p) => p.revenue) },
            orders: { value: orders, prev: prevOrders, trend: trendOf((p) => p.orders) },
            conversion: {
                value: orders / visits,
                prev: prevOrders / prevVisits,
                trend: trendOf((p) => p.orders / p.visits),
            },
            aov: {
                value: revenue / orders,
                prev: prevRevenue / prevOrders,
                trend: trendOf((p) => p.revenue / Math.max(p.orders, 1)),
            },
        },
        channels,
        devices,
        products,
        goal: { target, actual: monthToDate, elapsedShare: elapsed / monthDays },
    };
}

// ---------- formatting ----------

const compactFmt = new Intl.NumberFormat('ru-RU', { notation: 'compact', maximumFractionDigits: 1 });
const intFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const pctFmt = new Intl.NumberFormat('ru-RU', { style: 'percent', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' });

export const fmt = {
    compact: (v: number) => compactFmt.format(v),
    int: (v: number) => intFmt.format(v),
    money: (v: number) => `${intFmt.format(v)} ₽`,
    moneyCompact: (v: number) => `${compactFmt.format(v)} ₽`,
    pct: (v: number) => pctFmt.format(v),
    date: (d: Date) => dateFmt.format(d).replace('.', ''),
    /** Axis ticks: full under 10 000, compact above (one style per axis). */
    axis: (v: number, max: number) => (max >= 10000 ? compactFmt.format(v) : intFmt.format(v)),
};

/** Signed relative change, e.g. "+4,2 %". */
export function deltaOf(value: number, prev: number) {
    const rel = prev === 0 ? 0 : (value - prev) / prev;
    const sign = rel > 0 ? '+' : rel < 0 ? '−' : '';
    return { rel, text: `${sign}${pctFmt.format(Math.abs(rel))}` };
}

export function niceTicks(max: number, count = 4): number[] {
    if (max <= 0) return [0];
    const rough = max / count;
    const pow = 10 ** Math.floor(Math.log10(rough));
    const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough)!;
    const ticks: number[] = [];
    for (let v = 0; v <= max + step * 0.999; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
    return ticks;
}
