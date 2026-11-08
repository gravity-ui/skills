import type {TimeSeriesData} from './widget';

/** Детерминированный ГПСЧ (mulberry32), чтобы демо-данные не менялись между перезагрузками. */
function rng(seed: number) {
    return () => {
        seed = (seed + 0x6d2b79f5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const END = Date.UTC(2026, 10, 1);
const DAY = 24 * 3600 * 1000;

/** 90 дней продаж по трём регионам, тыс. ₽ в день. */
export function makeSales(): TimeSeriesData {
    const days = 90;
    const timeline = Array.from({length: days}, (_, i) => END - (days - 1 - i) * DAY);
    const make = (id: string, name: string, base: number, growth: number, seed: number) => {
        const r = rng(seed);
        return {
            id,
            name,
            values: timeline.map((t, i) => {
                const weekend = [0, 6].includes(new Date(t).getUTCDay()) ? 0.82 : 1;
                return Math.round(base * (1 + (growth * i) / days) * weekend * (0.9 + r() * 0.2));
            }),
        };
    };
    return {
        timeline,
        series: [
            make('msk', 'Москва', 420, 0.25, 1),
            make('spb', 'Санкт-Петербург', 260, 0.15, 2),
            make('reg', 'Регионы', 310, 0.4, 3),
        ],
    };
}

/** 24 часа загрузки CPU с шагом 10 секунд (8 640 точек × 3 хоста), %. */
export function makeMonitoring(): TimeSeriesData {
    const step = 10_000;
    const count = 8640;
    const start = END - count * step;
    const timeline = Array.from({length: count}, (_, i) => start + i * step);
    const make = (id: string, name: string, base: number, seed: number) => {
        const r = rng(seed);
        let noise = 0;
        return {
            id,
            name,
            values: timeline.map((_, i) => {
                noise = noise * 0.9 + (r() - 0.5) * 8;
                const daily = Math.sin((i / count) * Math.PI * 2 - 1.2) * 14;
                const spike = r() > 0.9985 ? 30 + r() * 20 : 0;
                return Math.round(Math.min(100, Math.max(1, base + daily + noise + spike)) * 10) / 10;
            }),
        };
    };
    return {
        timeline,
        series: [make('web-1', 'web-1', 42, 11), make('web-2', 'web-2', 55, 12), make('db-1', 'db-1', 30, 13)],
    };
}
