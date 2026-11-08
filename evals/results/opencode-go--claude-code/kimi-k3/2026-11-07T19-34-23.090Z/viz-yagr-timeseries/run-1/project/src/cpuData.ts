/**
 * Имитация источника метрик CPU для страницы мониторинга.
 *
 * Окно — последние 24 часа с шагом 1 с (86 400 точек — «несколько десятков
 * тысяч»). Раз в секунду добавляется новая точка, а самая старая
 * вытесняется: окно скользит, его размер постоянен.
 */

export const STEP_MS = 1000;
export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const POINTS_PER_WINDOW = WINDOW_MS / STEP_MS; // 86_400

/**
 * Сколько точек максимум догоняем одним обновлением после «сна» вкладки
 * (setInterval троттлится в фоне). Дальше просто отрезаем хвост окна.
 */
export const MAX_CATCH_UP_POINTS = 3600;

export interface CpuWindow {
    /** Метки времени, мс, выровнены по STEP_MS. */
    timeline: number[];
    /** Загрузка CPU, % (0..100). */
    values: number[];
}

export interface CpuSample {
    time: number;
    value: number;
}

export type CpuSampler = (t: number) => number;

export function alignTime(ts: number): number {
    return Math.floor(ts / STEP_MS) * STEP_MS;
}

/** Детерминированный ГПСЧ (mulberry32), чтобы история была воспроизводимой. */
function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Суточный профиль нагрузки: ночной минимум, дневной пик. */
function baseline(t: number): number {
    const d = new Date(t);
    const hours = d.getHours() + d.getMinutes() / 60 + d.getSeconds() / 3600;
    return 31.5 + 13.5 * Math.sin(((hours - 9) / 24) * Math.PI * 2);
}

/**
 * Сэмплер загрузки: случайное блуждание с возвратом к суточному профилю
 * и редкими всплесками/провалами. Состоятельный — вызывать последовательно.
 */
export function createCpuSampler(seed = 42): CpuSampler {
    const rand = mulberry32(seed);
    let level = 32;

    return (t: number): number => {
        level += (baseline(t) - level) * 0.05 + (rand() - 0.5) * 2.5;
        if (rand() < 0.0012) {
            level += 18 + rand() * 25; // всплеск
        }
        if (rand() < 0.0008) {
            level -= 10 + rand() * 8; // провал
        }
        level = Math.min(98, Math.max(2, level));
        return Math.round(level * 10) / 10;
    };
}

/** Полное окно за последние 24 часа (ровно POINTS_PER_WINDOW точек). */
export function generateHistory(now: number = Date.now()): CpuWindow {
    const end = alignTime(now);
    const start = end - WINDOW_MS + STEP_MS;
    const timeline = new Array<number>(POINTS_PER_WINDOW);
    const values = new Array<number>(POINTS_PER_WINDOW);
    const sampler = createCpuSampler();

    for (let i = 0; i < POINTS_PER_WINDOW; i++) {
        const t = start + i * STEP_MS;
        timeline[i] = t;
        values[i] = sampler(t);
    }
    return {timeline, values};
}

/**
 * Дополняет окно точками от последней известной до `now` (по сетке 1 с).
 * Мутирует переданное окно (push + вытеснение старых точек) и возвращает
 * только добавленный кусок — его можно инкрементально отдать графику.
 * Возвращает null, если новых точек нет.
 */
export function extendWindow(
    window: CpuWindow,
    sampler: CpuSampler,
    now: number = Date.now(),
): CpuWindow | null {
    const end = alignTime(now);
    const lastT = window.timeline[window.timeline.length - 1];
    const gap = Math.round((end - lastT) / STEP_MS);
    if (gap <= 0) {
        return null;
    }

    const count = Math.min(gap, MAX_CATCH_UP_POINTS);
    const timeline = new Array<number>(count);
    const values = new Array<number>(count);
    const start = end - (count - 1) * STEP_MS;

    for (let i = 0; i < count; i++) {
        timeline[i] = start + i * STEP_MS;
        values[i] = sampler(timeline[i]);
    }

    window.timeline.push(...timeline);
    window.values.push(...values);
    const overflow = window.timeline.length - POINTS_PER_WINDOW;
    if (overflow > 0) {
        window.timeline.splice(0, overflow);
        window.values.splice(0, overflow);
    }

    return {timeline, values};
}

export interface CpuStats {
    current: number;
    avg: number;
    max: number;
}

export function computeStats(values: number[]): CpuStats {
    let sum = 0;
    let max = -Infinity;
    for (const v of values) {
        sum += v;
        if (v > max) {
            max = v;
        }
    }
    const count = values.length || 1;
    return {
        current: values[values.length - 1] ?? 0,
        avg: sum / count,
        max: max === -Infinity ? 0 : max,
    };
}

export interface HourlyRow {
    /** Начало часа, мс. */
    hourStart: number;
    avg: number;
    max: number;
}

/** Почасовая сводка по окну — табличное представление графика (a11y). */
export function computeHourly({timeline, values}: CpuWindow): HourlyRow[] {
    const buckets = new Map<number, {sum: number; max: number; count: number}>();
    for (let i = 0; i < timeline.length; i++) {
        const hourStart = Math.floor(timeline[i] / 3_600_000) * 3_600_000;
        const v = values[i];
        let b = buckets.get(hourStart);
        if (!b) {
            b = {sum: 0, max: -Infinity, count: 0};
            buckets.set(hourStart, b);
        }
        b.sum += v;
        b.count += 1;
        if (v > b.max) {
            b.max = v;
        }
    }
    return [...buckets.entries()]
        .map(([hourStart, b]) => ({
            hourStart,
            avg: Math.round((b.sum / b.count) * 10) / 10,
            max: b.max,
        }))
        .sort((a, b) => b.hourStart - a.hourStart);
}
