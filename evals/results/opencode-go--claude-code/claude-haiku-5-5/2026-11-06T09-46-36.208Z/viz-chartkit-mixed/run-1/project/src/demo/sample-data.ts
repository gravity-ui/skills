import type {ChartDataset, ChartMode} from '../chart-widget';

/** Small deterministic PRNG (mulberry32), so the demo renders the same data on every load. */
function random(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const DAY = 24 * 60 * 60 * 1000;

/** Daily revenue for 90 days, three channels: one value per day, a weekly rhythm and noise. */
function salesDataset(): ChartDataset {
    const rnd = random(42);
    const start = Date.UTC(2026, 7, 8);
    const channels = [
        {id: 'online', name: 'Онлайн', base: 1_200_000},
        {id: 'retail', name: 'Розница', base: 900_000},
        {id: 'partners', name: 'Партнёры', base: 600_000},
    ];

    return {
        unit: '₽',
        series: channels.map((channel, c) => ({
            id: channel.id,
            name: channel.name,
            points: Array.from({length: 90}, (_, day) => {
                const weekly = 1 + 0.12 * Math.sin((2 * Math.PI * day) / 7 + c);
                const trend = 1 + day * 0.002;
                const noise = 1 + (rnd() - 0.5) * 0.16;
                return {x: start + day * DAY, y: Math.round(channel.base * weekly * trend * noise)};
            }),
        })),
    };
}

/**
 * 24 hours of latency percentiles sampled every 5 seconds: 17 280 points per series.
 * This is the dense case that a canvas engine exists for.
 */
function monitoringDataset(): ChartDataset {
    const rnd = random(7);
    const end = Date.UTC(2026, 10, 6);
    const step = 5_000;
    const count = (24 * 60 * 60 * 1000) / step;
    const percentiles = [
        {id: 'p50', name: 'p50', base: 80},
        {id: 'p95', name: 'p95', base: 240},
        {id: 'p99', name: 'p99', base: 610},
    ];

    return {
        unit: 'мс',
        series: percentiles.map((p, k) => ({
            id: p.id,
            name: p.name,
            points: Array.from({length: count}, (_, i) => {
                const hourOfDay = (i * step) / 3_600_000;
                const diurnal = 1 + 0.25 * Math.sin((2 * Math.PI * hourOfDay) / 24 - 1.2);
                const jitter = 1 + (rnd() - 0.5) * 0.3 * (k + 1);
                const spike = rnd() < 0.002 ? 2.5 + rnd() * 2 : 1;
                return {x: end - (count - i) * step, y: Math.round(p.base * diurnal * jitter * spike)};
            }),
        })),
    };
}

export const SAMPLE_DATASETS: Record<ChartMode, ChartDataset> = {
    sales: salesDataset(),
    monitoring: monitoringDataset(),
};
