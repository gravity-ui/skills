import type {TimeSeries, VisualizationDatasets} from './visualization/types';

/** Small deterministic PRNG (mulberry32) so the demo looks the same on every load. */
function createRandom(seed: number) {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Monthly revenue by sales channel: Jan 2025 – Oct 2026. */
function buildSalesSeries(): TimeSeries[] {
    const random = createRandom(42);
    const months = Array.from({length: 22}, (_, i) => Date.UTC(2025, i, 1));
    const seasonality = (i: number) => 1 + 0.25 * Math.sin(((i % 12) - 2) * (Math.PI / 6));

    const channel = (id: string, name: string, base: number, growth: number): TimeSeries => ({
        id,
        name,
        timestamps: months,
        values: months.map((_, i) =>
            Math.round(base * (1 + growth * i) * seasonality(i) * (0.92 + random() * 0.16)),
        ),
    });

    return [
        channel('online', 'Онлайн', 4_200_000, 0.035),
        channel('retail', 'Розница', 5_600_000, 0.008),
    ];
}

/** API latency percentiles sampled every 10 s over the last 24 h (8 640 points per series). */
function buildMonitoringSeries(): TimeSeries[] {
    const random = createRandom(7);
    const stepMs = 10_000;
    const end = Date.UTC(2026, 10, 7, 12, 0, 0);
    const count = (24 * 60 * 60 * 1000) / stepMs;
    const timestamps = Array.from({length: count}, (_, i) => end - (count - 1 - i) * stepMs);

    const p50: Array<number | null> = [];
    const p95: Array<number | null> = [];
    const p99: Array<number | null> = [];

    timestamps.forEach((ts, i) => {
        const hour = new Date(ts).getUTCHours() + new Date(ts).getUTCMinutes() / 60;
        const dailyLoad = 1 + 0.6 * Math.max(0, Math.sin(((hour - 6) / 24) * 2 * Math.PI));
        const incident = i > 5200 && i < 5400 ? 3.5 : 1;
        // Short scrape outage → gap in the data.
        if (i > 3000 && i < 3060) {
            p50.push(null);
            p95.push(null);
            p99.push(null);
            return;
        }
        const base = 40 * dailyLoad * incident;
        p50.push(Math.round(base * (0.9 + random() * 0.2)));
        p95.push(Math.round(base * 2.4 * (0.85 + random() * 0.3)));
        p99.push(Math.round(base * 4 * (0.8 + random() * 0.5)));
    });

    return [
        {id: 'p50', name: 'p50', timestamps, values: p50},
        {id: 'p95', name: 'p95', timestamps, values: p95},
        {id: 'p99', name: 'p99', timestamps, values: p99},
    ];
}

export function buildDemoDatasets(): VisualizationDatasets {
    return {
        sales: {series: buildSalesSeries(), yAxisTitle: 'Выручка, ₽'},
        monitoring: {series: buildMonitoringSeries(), yAxisTitle: 'Задержка, мс', timeZone: 'Europe/Moscow'},
    };
}
