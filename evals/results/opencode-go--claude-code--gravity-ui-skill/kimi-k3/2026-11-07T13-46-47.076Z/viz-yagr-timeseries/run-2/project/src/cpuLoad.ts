/**
 * Симуляция потока телеметрии CPU: 24 часа с шагом в 1 секунду
 * (86 400 точек — «несколько десятков тысяч»), обновление раз в секунду.
 */

export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const STEP_MS = 1000;
export const POINTS_COUNT = WINDOW_MS / STEP_MS;

export interface CpuLoadData {
    /** Метки времени, мс (UTC epoch) */
    timeline: number[];
    /** Загрузка CPU, % (0–100) */
    values: number[];
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/**
 * Следующее значение ряда: суточный паттерн (пик днём), AR(1)-шум
 * и редкие всплески нагрузки.
 */
function nextValue(prev: number, timestamp: number): number {
    const date = new Date(timestamp);
    const hour = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;
    // Дневной пик около 14:00, ночью — фоновая нагрузка.
    const baseline = 28 + 30 * Math.exp(-((hour - 14) ** 2) / 18);

    let value = prev + (baseline - prev) * 0.002 + (Math.random() - 0.5) * 2.5;

    // Всплески (деплой, бэкап, GC) — примерно раз в несколько минут.
    if (Math.random() < 0.004) {
        value += 25 + Math.random() * 45;
    }

    return clamp(value, 2, 98);
}

/** Начальный срез: последние 24 часа от `now`. */
export function generateInitialCpuLoad(now: number = Date.now()): CpuLoadData {
    const timeline = new Array<number>(POINTS_COUNT);
    const values = new Array<number>(POINTS_COUNT);

    let value = 30;
    for (let i = 0; i < POINTS_COUNT; i++) {
        const t = now - (POINTS_COUNT - 1 - i) * STEP_MS;
        timeline[i] = t;
        value = nextValue(value, t);
        values[i] = Math.round(value * 10) / 10;
    }

    return {timeline, values};
}

/**
 * Добавляет свежую точку и вытесняет самую старую,
 * сохраняя скользящее окно в 24 часа. Возвращает новые массивы,
 * чтобы React заметил обновление.
 */
export function advanceCpuLoad(prev: CpuLoadData, now: number = Date.now()): CpuLoadData {
    const timeline = prev.timeline.slice(1);
    const values = prev.values.slice(1);

    timeline.push(now);
    values.push(Math.round(nextValue(prev.values[prev.values.length - 1], now) * 10) / 10);

    return {timeline, values};
}
