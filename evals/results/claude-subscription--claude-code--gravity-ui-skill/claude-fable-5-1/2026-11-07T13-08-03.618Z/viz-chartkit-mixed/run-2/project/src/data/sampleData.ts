import type {VisualizationWidgetData} from '../widgets/VisualizationWidget';

const DAY = 24 * 60 * 60 * 1000;

/** Детерминированный псевдослучайный генератор, чтобы демо-данные были стабильны между рендерами. */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
    };
}

/** Продажи по дням за последние 30 дней — редкие точки, обычный линейный график. */
export function buildSalesData(now = Date.UTC(2026, 10, 7)): VisualizationWidgetData {
    const random = createRandom(42);
    const timestamps: number[] = [];
    const online: number[] = [];
    const retail: number[] = [];

    for (let day = 29; day >= 0; day -= 1) {
        const ts = now - day * DAY;
        const weekday = new Date(ts).getUTCDay();
        const weekendBoost = weekday === 0 || weekday === 6 ? 1.35 : 1;
        timestamps.push(ts);
        online.push(Math.round((180 + random() * 60) * weekendBoost));
        retail.push(Math.round((120 + random() * 40) / weekendBoost));
    }

    return {
        timestamps,
        valueLabel: 'Выручка, тыс. ₽',
        unit: 'тыс. ₽',
        timeZone: 'Europe/Moscow',
        series: [
            {id: 'online', name: 'Онлайн', values: online},
            {id: 'retail', name: 'Розница', values: retail},
        ],
    };
}

/** Мониторинг: 3 метрики с шагом 10 секунд за последние 6 часов (2160 точек на серию). */
export function buildMonitoringData(now = Date.UTC(2026, 10, 7, 12)): VisualizationWidgetData {
    const random = createRandom(7);
    const stepMs = 10_000;
    const points = (6 * 60 * 60 * 1000) / stepMs;
    const timestamps: number[] = [];
    const rps: Array<number | null> = [];
    const p99: Array<number | null> = [];
    const errors: Array<number | null> = [];

    for (let i = 0; i < points; i += 1) {
        const ts = now - (points - 1 - i) * stepMs;
        timestamps.push(ts);

        const phase = (i / points) * Math.PI * 4;
        const load = 400 + Math.sin(phase) * 120 + random() * 40;
        const incident = i > points * 0.62 && i < points * 0.68;

        rps.push(Math.round(load));
        p99.push(Math.round((incident ? 900 : 180) + Math.sin(phase * 3) * 25 + random() * 30));
        // Небольшой провал данных в сборе ошибок — проверка обработки null.
        errors.push(i > points * 0.3 && i < points * 0.31 ? null : Math.round(incident ? 40 + random() * 20 : random() * 4));
    }

    return {
        timestamps,
        valueLabel: 'req/s · ms · errors',
        timeZone: 'Europe/Moscow',
        series: [
            {id: 'rps', name: 'Запросы, req/s', values: rps},
            {id: 'p99', name: 'Латентность p99, ms', values: p99},
            {id: 'errors', name: 'Ошибки 5xx', values: errors},
        ],
    };
}
