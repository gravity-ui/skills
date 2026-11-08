import type {VizSeriesData} from '../widgets/VizWidget';

/** Deterministic PRNG so demo data is stable across renders and reloads. */
function mulberry32(seed: number): () => number {
    let state = seed >>> 0;

    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


/** Monthly revenue for the last 24 months (thousand ₽): a regular, sparse business series. */
export function createSalesData(now = new Date(2026, 10, 1)): VizSeriesData {
    const random = mulberry32(2026);
    const timeline: number[] = [];
    const values: Array<number | null> = [];
    const months = 24;

    for (let index = months - 1; index >= 0; index -= 1) {
        const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
        const position = months - 1 - index;
        const trend = 1800 + position * 38;
        const season = 320 * Math.sin(((date.getMonth() - 2) / 12) * Math.PI * 2);
        const decemberBoost = date.getMonth() === 11 ? 420 : 0;
        const noise = (random() - 0.5) * 220;

        timeline.push(date.getTime());
        values.push(Math.round(trend + season + decemberBoost + noise));
    }

    return {
        timeline,
        series: [{id: 'revenue', name: 'Выручка', values}],
    };
}

/**
 * Requests per second on three nodes, one point every 5 seconds for 24 hours
 * (17 280 points per series): a dense monitoring series for the canvas engine.
 * `node-2` has a 12-minute outage rendered as a gap.
 */
export function createMonitoringData(now = Date.now()): VizSeriesData {
    const random = mulberry32(42);
    const stepMs = 5_000;
    const points = (24 * 60 * 60 * 1000) / stepMs;
    const end = Math.floor(now / stepMs) * stepMs;
    const start = end - (points - 1) * stepMs;

    const timeline: number[] = new Array(points);
    const nodes = [
        {id: 'node-1', name: 'node-1', base: 820, phase: 0},
        {id: 'node-2', name: 'node-2', base: 760, phase: 0.6},
        {id: 'node-3', name: 'node-3', base: 690, phase: 1.3},
    ];
    const values = nodes.map(() => new Array<number | null>(points));

    const outageStart = start + 14 * 60 * 60 * 1000;
    const outageEnd = outageStart + 12 * 60 * 1000;
    const spikeAt = start + 9 * 60 * 60 * 1000;

    for (let index = 0; index < points; index += 1) {
        const ts = start + index * stepMs;
        timeline[index] = ts;

        const dayPhase = ((ts % (24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000)) * Math.PI * 2;

        nodes.forEach((node, nodeIndex) => {
            if (node.id === 'node-2' && ts >= outageStart && ts < outageEnd) {
                values[nodeIndex][index] = null;
                return;
            }

            const daily = 0.28 * Math.sin(dayPhase - 1.2 + node.phase);
            const spike =
                Math.abs(ts - spikeAt) < 6 * 60 * 1000
                    ? 0.9 * Math.exp(-(((ts - spikeAt) / (2 * 60 * 1000)) ** 2))
                    : 0;
            const noise = (random() - 0.5) * 0.12;

            values[nodeIndex][index] = Math.max(0, Math.round(node.base * (1 + daily + spike + noise)));
        });
    }

    return {
        timeline,
        series: nodes.map((node, nodeIndex) => ({
            id: node.id,
            name: node.name,
            values: values[nodeIndex],
        })),
    };
}
