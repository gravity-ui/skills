import type {ChartWidgetDatasets, TimePoint} from './chart-widget';

// Детерминированный ГПСЧ, чтобы демо-данные не менялись между рендерами и перезагрузками.
function mulberry32(seed: number) {
    return () => {
        seed |= 0;
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function monthlySales(base: number, growth: number, seed: number): TimePoint[] {
    const random = mulberry32(seed);
    return Array.from({length: 12}, (_, month) => {
        const seasonality = 1 + 0.25 * Math.sin(((month - 2) / 12) * 2 * Math.PI);
        const noise = 0.9 + random() * 0.2;
        return [Date.UTC(2025, month, 1), Math.round(base * (1 + growth * month) * seasonality * noise)];
    });
}

const STEP_MS = 10_000; // одна точка каждые 10 секунд
const POINTS = 8_640; // ровно сутки

function latencySeries(baseMs: number, spikeChance: number, seed: number, start: number): TimePoint[] {
    const random = mulberry32(seed);
    let drift = 0;
    return Array.from({length: POINTS}, (_, i) => {
        const ts = start + i * STEP_MS;
        // Короткие провалы сбора метрик — реальные пропуски, а не нули.
        if (i % 2000 > 1985) return [ts, null];
        const daily = 1 + 0.35 * Math.sin((i / POINTS) * 2 * Math.PI - Math.PI / 2);
        drift = drift * 0.95 + (random() - 0.5) * 0.4;
        const spike = random() < spikeChance ? random() * 3 : 0;
        return [ts, Math.max(1, baseMs * daily * (1 + drift + spike))];
    });
}

export function createDemoDatasets(): ChartWidgetDatasets {
    const start = Date.UTC(2025, 9, 27);
    return {
        sales: {
            title: 'Выручка по каналам, 2025',
            unit: '₽',
            series: [
                {id: 'online', name: 'Онлайн', points: monthlySales(4_200_000, 0.06, 1)},
                {id: 'retail', name: 'Розница', points: monthlySales(5_100_000, 0.01, 2)},
            ],
        },
        monitoring: {
            title: 'Время ответа API, 24 ч (шаг 10 с)',
            unit: 'ms',
            precision: 1,
            series: [
                {id: 'p50', name: 'p50', points: latencySeries(40, 0.002, 3, start)},
                {id: 'p95', name: 'p95', points: latencySeries(120, 0.006, 4, start)},
                {id: 'p99', name: 'p99', points: latencySeries(260, 0.01, 5, start)},
            ],
        },
    };
}
