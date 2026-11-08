/**
 * Источник данных о загрузке CPU.
 *
 * ВАЖНО: это имитация (mock). Значения детерминированно вычисляются по временной сетке,
 * поэтому история и «живые» точки всегда согласованы. Чтобы подключить реальный бэкенд,
 * замените `cpuValueAt` на запрос к API, сохранив контракт: точки на сетке `CPU_STEP_MS`,
 * значения в процентах 0–100, возвращаемые метки времени — в миллисекундах.
 */

export const CPU_STEP_MS = 2_000;
export const CPU_WINDOW_MS = 24 * 60 * 60 * 1000;
/** 24 ч при шаге 2 с — 43 200 точек в окне. */
export const CPU_WINDOW_POINTS = CPU_WINDOW_MS / CPU_STEP_MS;

const DAY_MS = 24 * 60 * 60 * 1000;

export interface CpuSeries {
    /** Метки времени, мс. Строго возрастают с шагом CPU_STEP_MS. */
    timeline: number[];
    /** Загрузка CPU, %. */
    values: number[];
}

/** Детерминированный хеш целого числа в диапазоне [0, 1). */
function noise(n: number): number {
    let x = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
    x ^= x >>> 13;
    x = Math.imul(x, 0xc2b2ae35);
    x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
}

export function cpuValueAt(ts: number): number {
    const index = Math.round(ts / CPU_STEP_MS);
    const daily = 15 * Math.sin((2 * Math.PI * ts) / DAY_MS);
    const slow = 8 * Math.sin(ts / 600_000);
    const jitter = (noise(index) - 0.5) * 16;
    const spike = noise(index * 7 + 3) > 0.993 ? 35 * noise(index * 13 + 1) : 0;
    const value = 40 + daily + slow + jitter + spike;
    return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

function alignDown(ts: number): number {
    return Math.floor(ts / CPU_STEP_MS) * CPU_STEP_MS;
}

function fill(from: number, to: number): CpuSeries {
    const timeline: number[] = [];
    const values: number[] = [];
    for (let ts = from; ts <= to; ts += CPU_STEP_MS) {
        timeline.push(ts);
        values.push(cpuValueAt(ts));
    }
    return {timeline, values};
}

/** Последние 24 часа, заканчивающиеся на последнем узле сетки до `now`. */
export function cpuHistory(now: number): CpuSeries {
    const last = alignDown(now);
    return fill(last - (CPU_WINDOW_POINTS - 1) * CPU_STEP_MS, last);
}

/**
 * Точки строго после `lastTs` и не позже `now`.
 * Если `lastTs` уже актуален, возвращает пустой набор.
 * После долгой паузы результат ограничен размером окна: более старые точки всё равно
 * вытеснены бы из графика, а большой массив нельзя передавать через spread.
 */
export function cpuPointsAfter(lastTs: number, now: number): CpuSeries {
    const last = alignDown(now);
    const windowStart = last - (CPU_WINDOW_POINTS - 1) * CPU_STEP_MS;
    return fill(Math.max(lastTs + CPU_STEP_MS, windowStart), last);
}
