import type {ChartWidgetData} from './chart-widget';

/** Детерминированный ГПСЧ, чтобы демо-данные не прыгали между перезагрузками. */
function mulberry32(seed: number) {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Выручка по месяцам за 2 года: два канала продаж, рост + сезонность (пик в декабре). */
export function createSalesData(): ChartWidgetData {
    const random = mulberry32(42);
    const months = 24;
    const timeline: number[] = [];
    const online: number[] = [];
    const retail: number[] = [];

    for (let i = 0; i < months; i++) {
        const date = new Date(2024, 10 + i, 1);
        const season = 1 + 0.25 * Math.cos(((date.getMonth() - 11) / 12) * 2 * Math.PI);
        timeline.push(date.getTime());
        online.push(Math.round(2_400_000 * (1 + i * 0.035) * season * (0.92 + random() * 0.16)));
        retail.push(Math.round(3_100_000 * (1 + i * 0.008) * season * (0.92 + random() * 0.16)));
    }

    return {
        timeline,
        series: [
            {id: 'online', name: 'Онлайн', values: online},
            {id: 'retail', name: 'Розница', values: retail},
        ],
        valueFormat: {unit: '₽', compact: true},
        yMin: 0,
    };
}

/** Загрузка CPU трёх хостов поминутно за неделю (~30 тыс. точек), с суточным циклом, пиками и пропуском. */
export function createMonitoringData(): ChartWidgetData {
    const random = mulberry32(7);
    const step = 60_000;
    const count = 7 * 24 * 60;
    const start = Date.UTC(2026, 9, 21);
    const timeline = Array.from({length: count}, (_, i) => start + i * step);

    const hosts = [
        {id: 'web-1', name: 'web-1', base: 38, amplitude: 18},
        {id: 'web-2', name: 'web-2', base: 32, amplitude: 16},
        {id: 'db-1', name: 'db-1', base: 55, amplitude: 10},
    ];

    const series = hosts.map((host) => {
        let noise = 0;
        let spike = 0;
        const values = timeline.map<number | null>((ts, i) => {
            const hour = new Date(ts).getUTCHours() + new Date(ts).getUTCMinutes() / 60;
            const daily = Math.sin(((hour - 9) / 24) * 2 * Math.PI);
            noise = noise * 0.9 + (random() - 0.5) * 4;
            if (random() < 0.0015) {
                spike = 20 + random() * 30;
            }
            spike *= 0.93;
            const value = host.base + host.amplitude * daily + noise + spike;
            return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
        });

        return {id: host.id, name: host.name, values};
    });

    // Сбой сбора метрик у web-2: 40 минут без данных — разрыв линии, а не интерполяция.
    const gapStart = 3 * 24 * 60 + 14 * 60;
    for (let i = gapStart; i < gapStart + 40; i++) {
        series[1].values[i] = null;
    }

    return {
        timeline,
        series,
        valueFormat: {unit: '%', precision: 1},
        yMin: 0,
        yMax: 100,
    };
}
