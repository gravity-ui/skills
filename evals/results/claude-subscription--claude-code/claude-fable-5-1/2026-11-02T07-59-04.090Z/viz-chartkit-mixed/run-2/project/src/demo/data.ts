import type {TimeSeriesDataset, TimeSeriesPoint} from '../widget';

/** Детерминированный генератор (mulberry32), чтобы демо выглядело одинаково при каждом запуске. */
function createRandom(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const MONTH = 24;

/** Продажи: 24 месяца, три канала, в тысячах рублей. */
export function createSalesDataset(): TimeSeriesDataset {
    const rand = createRandom(42);
    const start = Date.UTC(2024, 10, 1);
    const channels = [
        {id: 'online', name: 'Онлайн', base: 820, growth: 1.025, season: 180},
        {id: 'retail', name: 'Розница', base: 640, growth: 1.008, season: 120},
        {id: 'wholesale', name: 'Опт', base: 410, growth: 1.012, season: 60},
    ];

    return {
        valueLabel: 'Выручка, тыс. ₽',
        unit: 'тыс. ₽',
        precision: 0,
        series: channels.map((c) => {
            const points: TimeSeriesPoint[] = [];
            let level = c.base;
            for (let i = 0; i < MONTH; i++) {
                const d = new Date(start);
                d.setUTCMonth(d.getUTCMonth() + i);
                const month = d.getUTCMonth();
                const seasonal = c.season * Math.sin(((month - 1) / 12) * Math.PI * 2) + (month === 11 ? c.season : 0);
                level *= c.growth;
                const noise = (rand() - 0.5) * c.base * 0.12;
                points.push({x: d.getTime(), y: Math.round(level + seasonal + noise)});
            }
            return {id: c.id, name: c.name, points};
        }),
    };
}

const STEP_MS = 5_000;
const HOURS = 24;

/** Мониторинг: 24 часа с шагом 5 секунд (17 280 точек на серию), загрузка CPU трёх хостов. */
export function createMonitoringDataset(): TimeSeriesDataset {
    const rand = createRandom(7);
    const count = (HOURS * 3600 * 1000) / STEP_MS;
    const end = Date.UTC(2026, 10, 2, 8, 0, 0);
    const start = end - count * STEP_MS;
    const hosts = [
        {id: 'web-01', name: 'web-01', base: 42, amp: 18, spikeAt: 0.63},
        {id: 'web-02', name: 'web-02', base: 36, amp: 15, spikeAt: 0.31},
        {id: 'web-03', name: 'web-03', base: 28, amp: 12, spikeAt: -1},
    ];

    return {
        valueLabel: 'Загрузка CPU, %',
        unit: '%',
        precision: 1,
        timeZone: 'Europe/Moscow',
        series: hosts.map((h) => {
            const points: TimeSeriesPoint[] = new Array(count);
            let drift = 0;
            for (let i = 0; i < count; i++) {
                const t = i / count;
                const daily = h.amp * Math.sin((t - 0.25) * Math.PI * 2);
                drift += (rand() - 0.5) * 0.6;
                drift *= 0.995;
                const jitter = (rand() - 0.5) * 4;
                const spike =
                    h.spikeAt >= 0 && Math.abs(t - h.spikeAt) < 0.012
                        ? 38 * Math.exp(-((t - h.spikeAt) ** 2) / 0.00004)
                        : 0;
                // Короткий провал данных (сбой агента) у второго хоста.
                const gap = h.id === 'web-02' && t > 0.8 && t < 0.805;
                const value = gap ? null : Math.min(100, Math.max(0, h.base + daily + drift + jitter + spike));
                points[i] = {x: start + i * STEP_MS, y: value === null ? null : Math.round(value * 10) / 10};
            }
            return {id: h.id, name: h.name, points};
        }),
    };
}
