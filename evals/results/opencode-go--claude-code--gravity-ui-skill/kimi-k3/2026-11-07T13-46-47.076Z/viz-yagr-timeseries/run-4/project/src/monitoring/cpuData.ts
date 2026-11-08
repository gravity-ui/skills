/**
 * Mock-источник телеметрии CPU: скользящее окно за последние 24 часа
 * с шагом в 1 секунду (86 400 точек) и realtime-добавление новых точек.
 */

export const UPDATE_INTERVAL_MS = 1000;

const WINDOW_MS = 24 * 60 * 60 * 1000;
const POINTS_COUNT = WINDOW_MS / UPDATE_INTERVAL_MS; // 86 400

export interface CpuSeries {
    timeline: number[];
    values: number[];
    lastValue: number;
}

export interface CpuPoint {
    t: number;
    value: number;
}

/**
 * Базовый уровень нагрузки для момента времени: минимум ночью,
 * дневной пик около 12:00 и вечерний пик около 20:00.
 */
function dailyBaseline(timestamp: number): number {
    const date = new Date(timestamp);
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    const dayPeak = 18 * Math.exp(-((hour - 12) ** 2) / 18);
    const eveningPeak = 14 * Math.exp(-((hour - 20) ** 2) / 8);
    return 22 + dayPeak + eveningPeak;
}

/** Один шаг mean-reverting random walk с редкими всплесками нагрузки. */
function step(previous: number, timestamp: number): number {
    const baseline = dailyBaseline(timestamp);
    let value = previous + (baseline - previous) * 0.02 + (Math.random() - 0.5) * 3;
    if (Math.random() < 0.0015) {
        value += 20 + Math.random() * 35;
    }
    return Math.min(99, Math.max(1, value));
}

function round(value: number): number {
    return Math.round(value * 10) / 10;
}

/** Генерирует полную историю за последние 24 часа. */
export function generateInitialSeries(now: number = Date.now()): CpuSeries {
    const timeline = new Array<number>(POINTS_COUNT);
    const values = new Array<number>(POINTS_COUNT);
    const start = now - (POINTS_COUNT - 1) * UPDATE_INTERVAL_MS;

    let value = dailyBaseline(start);
    for (let i = 0; i < POINTS_COUNT; i++) {
        const t = start + i * UPDATE_INTERVAL_MS;
        value = step(value, t);
        timeline[i] = t;
        values[i] = round(value);
    }

    return {timeline, values, lastValue: values[POINTS_COUNT - 1]};
}

/**
 * Сдвигает окно на одну точку вперёд (добавляет новую справа,
 * выбрасывает самую старую слева) и возвращает новую точку.
 */
export function appendNextPoint(series: CpuSeries): CpuPoint {
    const t = series.timeline[series.timeline.length - 1] + UPDATE_INTERVAL_MS;
    const value = round(step(series.lastValue, t));

    series.timeline.push(t);
    series.timeline.shift();
    series.values.push(value);
    series.values.shift();
    series.lastValue = value;

    return {t, value};
}
