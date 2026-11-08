import type {TimeSeriesDataset} from './types';

/** Детерминированный PRNG, чтобы демо-данные не менялись между перезагрузками. */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

/** 12 месяцев продаж по двум каналам. */
export function createSalesDataset(): TimeSeriesDataset {
    const random = createRandom(42);
    const year = new Date().getFullYear() - 1;
    const timestamps = Array.from({length: 12}, (_, month) => Date.UTC(year, month, 1));
    const seasonal = (month: number) => 1 + 0.25 * Math.sin(((month - 2) / 12) * 2 * Math.PI);

    return {
        unit: 'тыс. ₽',
        timestamps,
        series: [
            {
                id: 'online',
                name: 'Онлайн',
                values: timestamps.map((_, m) => Math.round(820 * seasonal(m) * (1 + m * 0.03) + random() * 90)),
            },
            {
                id: 'retail',
                name: 'Розница',
                values: timestamps.map((_, m) => Math.round(640 * seasonal(m) + random() * 70)),
            },
        ],
    };
}

/** Сутки метрик с шагом 10 секунд: 8 640 точек × 3 ряда. */
export function createMonitoringDataset(): TimeSeriesDataset {
    const random = createRandom(7);
    const stepMs = 10_000;
    const points = 8640;
    const end = Math.floor(Date.now() / stepMs) * stepMs;
    const start = end - (points - 1) * stepMs;
    const timestamps = Array.from({length: points}, (_, i) => start + i * stepMs);

    const base = timestamps.map((ts) => {
        const hour = new Date(ts).getHours() + new Date(ts).getMinutes() / 60;
        return 120 + 80 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
    });

    const spike = (i: number) => (i > 5200 && i < 5260 ? 140 : 0);

    return {
        unit: 'мс',
        timestamps,
        series: [
            {id: 'p50', name: 'p50', values: base.map((v, i) => +(v * 0.5 + random() * 12 + spike(i) * 0.3).toFixed(1))},
            {id: 'p95', name: 'p95', values: base.map((v, i) => +(v + random() * 30 + spike(i)).toFixed(1))},
            {
                id: 'p99',
                name: 'p99',
                // Небольшой разрыв в данных — сбор метрик прерывался.
                values: base.map((v, i) => (i > 3000 && i < 3030 ? null : +(v * 1.6 + random() * 60 + spike(i) * 1.8).toFixed(1))),
            },
        ],
    };
}
