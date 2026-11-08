import type {TimeSeriesSet, VisualizationViews} from './types';

/** Детерминированный ГПСЧ, чтобы демо-данные не «прыгали» между рендерами. */
function mulberry32(seed: number) {
    let a = seed;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const round = (value: number, digits: number) => Number(value.toFixed(digits));

/** Помесячная выручка за год (12 точек на серию). */
export function createSalesData(year = 2026): TimeSeriesSet {
    const rand = mulberry32(year);
    const timeline = Array.from({length: 12}, (_, month) => Date.UTC(year, month, 1));
    const seasonal = (m: number) => 1 + 0.25 * Math.sin(((m - 2) / 12) * 2 * Math.PI) + (m === 11 ? 0.35 : 0);

    const previous = timeline.map((_, m) => round(38 * seasonal(m) * (0.92 + rand() * 0.16), 1));
    const current = previous.map((v, m) => round(v * (1.08 + m * 0.01 + (rand() - 0.5) * 0.1), 1));

    return {
        timeline,
        series: [
            {id: 'revenue-current', name: `Выручка ${year}`, values: current},
            {id: 'revenue-previous', name: `Выручка ${year - 1}`, values: previous},
        ],
    };
}

/** Плотный ряд мониторинга: загрузка CPU нескольких хостов с шагом 10 с за сутки. */
export function createMonitoringData({
    hosts = 4,
    stepMs = 10_000,
    durationMs = 24 * 60 * 60 * 1000,
    end = Math.floor(Date.now() / 60_000) * 60_000,
} = {}): TimeSeriesSet {
    const rand = mulberry32(42);
    const points = Math.floor(durationMs / stepMs);
    const start = end - points * stepMs;
    const timeline = Array.from({length: points}, (_, i) => start + i * stepMs);

    const series = Array.from({length: hosts}, (_, h) => {
        const base = 25 + h * 9;
        let drift = 0;
        const values = timeline.map((ts, i) => {
            // Короткий разрыв (агент не отвечал) — показываем как null.
            if (h === hosts - 1 && i > points * 0.62 && i < points * 0.62 + 90) {
                return null;
            }
            const hour = new Date(ts).getUTCHours() + new Date(ts).getUTCMinutes() / 60;
            const daily = 18 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);
            drift = drift * 0.98 + (rand() - 0.5) * 2.2;
            const spike = rand() > 0.9985 ? 25 + rand() * 30 : 0;
            return round(Math.min(100, Math.max(0, base + daily + drift + spike + (rand() - 0.5) * 6)), 1);
        });
        return {id: `host-${h + 1}`, name: `node-${String(h + 1).padStart(2, '0')}`, values};
    });

    return {timeline, series};
}

export function createDemoViews(): VisualizationViews {
    return {
        sales: {label: 'Продажи', unit: 'млн ₽', precision: 1, data: createSalesData()},
        monitoring: {label: 'Мониторинг', unit: '%', precision: 1, data: createMonitoringData()},
    };
}
