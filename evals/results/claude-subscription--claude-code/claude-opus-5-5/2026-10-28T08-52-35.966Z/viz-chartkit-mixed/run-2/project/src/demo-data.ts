import type {VizDataset} from './viz';

const DAY = 24 * 60 * 60 * 1000;
const END = Date.UTC(2026, 9, 28);

// Seeded PRNG (mulberry32) keeps the demo identical between reloads.
function createRandom(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const rubFormat = new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
});
const msFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export function createSalesDataset(days = 90): VizDataset {
    const random = createRandom(42);
    const timeline = Array.from({length: days}, (_, i) => END - (days - 1 - i) * DAY);
    const channel = (base: number, growth: number, weekendBoost: number) =>
        timeline.map((ts, i) => {
            const weekday = new Date(ts).getUTCDay();
            const weekend = weekday === 0 || weekday === 6 ? weekendBoost : 1;
            const noise = 0.9 + random() * 0.2;
            return Math.round(base * (1 + (growth * i) / days) * weekend * noise);
        });

    return {
        timeline,
        series: [
            {id: 'online', name: 'Онлайн', values: channel(820_000, 0.35, 1.25)},
            {id: 'retail', name: 'Розница', values: channel(640_000, 0.05, 1.4)},
            {id: 'marketplace', name: 'Маркетплейсы', values: channel(310_000, 0.8, 1.1)},
        ],
        formatValue: (value) => rubFormat.format(value),
    };
}

export function createMonitoringDataset(hours = 24, stepSeconds = 10): VizDataset {
    const random = createRandom(7);
    const step = stepSeconds * 1000;
    const count = Math.floor((hours * 60 * 60 * 1000) / step);
    const timeline = Array.from({length: count}, (_, i) => END - (count - 1 - i) * step);

    // Daily load wave, a 20-minute incident and two short scrape gaps.
    const incidentStart = Math.floor(count * 0.62);
    const incidentEnd = incidentStart + (20 * 60 * 1000) / step;
    const gaps = [
        [Math.floor(count * 0.3), Math.floor(count * 0.3) + 12],
        [Math.floor(count * 0.85), Math.floor(count * 0.85) + 6],
    ];
    const isGap = (i: number) => gaps.some(([from, to]) => i >= from && i < to);

    const p50: (number | null)[] = [];
    const p95: (number | null)[] = [];
    const p99: (number | null)[] = [];
    for (let i = 0; i < count; i++) {
        if (isGap(i)) {
            p50.push(null);
            p95.push(null);
            p99.push(null);
            continue;
        }
        const load = 1 + 0.35 * Math.sin((2 * Math.PI * i) / count - Math.PI / 2);
        const incident = i >= incidentStart && i < incidentEnd ? 2.6 : 1;
        const base = 38 * load * incident;
        const jitter = () => 0.85 + random() * 0.3;
        const value50 = base * jitter();
        const value95 = Math.max(value50, base * 2.4 * jitter());
        const value99 = Math.max(value95, base * 3.6 * jitter() + (random() < 0.01 ? 250 : 0));
        p50.push(Math.round(value50 * 10) / 10);
        p95.push(Math.round(value95 * 10) / 10);
        p99.push(Math.round(value99 * 10) / 10);
    }

    return {
        timeline,
        series: [
            {id: 'p50', name: 'p50', values: p50},
            {id: 'p95', name: 'p95', values: p95},
            {id: 'p99', name: 'p99', values: p99},
        ],
        formatValue: (value) => `${msFormat.format(value)} мс`,
    };
}
