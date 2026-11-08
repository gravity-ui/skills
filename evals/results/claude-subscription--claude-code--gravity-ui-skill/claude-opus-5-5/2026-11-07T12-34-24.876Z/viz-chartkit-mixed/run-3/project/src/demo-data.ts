import type {VisualizationDataset} from './widget';

/** Deterministic PRNG so the demo looks the same on every load. */
function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Monthly revenue by sales channel for the last 12 months (thousands of ₽). */
export function createSalesDataset(): VisualizationDataset {
    const rand = mulberry32(42);
    const now = new Date();
    const timestamps = Array.from({length: 12}, (_, i) =>
        new Date(now.getFullYear(), now.getMonth() - 12 + i, 1).getTime(),
    );
    const seasonal = (i: number) => 1 + 0.18 * Math.sin(((i + 2) / 12) * 2 * Math.PI);

    const channel = (base: number, growth: number) =>
        timestamps.map((_, i) => Math.round(base * (1 + growth * i) * seasonal(i) * (0.94 + rand() * 0.12)));

    return {
        timestamps,
        series: [
            {id: 'online', name: 'Онлайн', values: channel(4200, 0.035)},
            {id: 'retail', name: 'Розница', values: channel(5600, 0.008)},
        ],
    };
}

/** CPU load of three hosts over the last 24 hours with a 10-second step (8 640 points per host). */
export function createMonitoringDataset(): VisualizationDataset {
    const rand = mulberry32(7);
    const step = 10_000;
    const count = (24 * 60 * 60 * 1000) / step;
    const end = Math.floor(Date.now() / step) * step;
    const timestamps = Array.from({length: count}, (_, i) => end - (count - 1 - i) * step);

    const host = (base: number, spikeChance: number, gap?: [number, number]) => {
        let level = base;
        return timestamps.map((ts, i) => {
            if (gap && i >= gap[0] && i < gap[1]) {
                return null; // agent was offline — rendered as a gap
            }
            const hour = new Date(ts).getHours() + new Date(ts).getMinutes() / 60;
            const daily = 18 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
            level += (base + daily - level) * 0.02 + (rand() - 0.5) * 3;
            const spike = rand() < spikeChance ? 20 + rand() * 30 : 0;
            return Math.round(Math.min(100, Math.max(0, level + spike)) * 10) / 10;
        });
    };

    return {
        timestamps,
        series: [
            {id: 'web-1', name: 'web-1', values: host(42, 0.002)},
            {id: 'web-2', name: 'web-2', values: host(35, 0.003, [5200, 5560])},
            {id: 'db-1', name: 'db-1', values: host(58, 0.001)},
        ],
    };
}
