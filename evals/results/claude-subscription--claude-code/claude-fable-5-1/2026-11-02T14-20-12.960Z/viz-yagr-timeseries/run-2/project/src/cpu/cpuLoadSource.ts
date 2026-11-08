/**
 * Источник данных загрузки CPU.
 *
 * Хранит скользящее окно точек (по умолчанию 24 часа) и уведомляет подписчиков
 * о каждой новой порции данных. Чтобы не гонять десятки тысяч точек через React-state,
 * график подписывается на источник напрямую и получает только приращение
 * (новые точки + число точек, вытесненных из окна).
 */

export const SECOND_MS = 1_000;
export const DAY_MS = 24 * 60 * 60 * SECOND_MS;

export interface CpuLoadSnapshot {
    /** Метки времени, мс (unix epoch), по возрастанию */
    timeline: number[];
    /** Загрузка CPU в процентах, 0..100 */
    values: number[];
}

export interface CpuLoadBatch extends CpuLoadSnapshot {
    /** Сколько самых старых точек было вытеснено из окна при добавлении этой порции */
    dropped: number;
}

export interface CpuLoadStats {
    current: number | null;
    average: number | null;
    max: number | null;
    points: number;
}

export type CpuLoadListener = (batch: CpuLoadBatch) => void;

export interface CpuLoadSource {
    /** Копия текущего окна данных (безопасно отдавать в сторонние библиотеки, которые мутируют массивы) */
    getSnapshot(): CpuLoadSnapshot;
    /** Агрегаты по текущему окну */
    getStats(): CpuLoadStats;
    /** Подписка на приращения; возвращает функцию отписки */
    subscribe(listener: CpuLoadListener): () => void;
    /** Останавливает поток и отписывает всех слушателей */
    dispose(): void;
}

/** Скользящее окно фиксированной длительности. */
export class SlidingWindowBuffer {
    readonly timeline: number[] = [];
    readonly values: number[] = [];

    constructor(readonly windowMs: number) {
        if (!(windowMs > 0)) {
            throw new Error('windowMs must be positive');
        }
    }

    get length() {
        return this.timeline.length;
    }

    /**
     * Добавляет точку и вытесняет всё, что старше окна относительно неё.
     * @returns число вытесненных точек
     */
    push(ts: number, value: number): number {
        this.timeline.push(ts);
        this.values.push(value);

        const threshold = ts - this.windowMs;
        let drop = 0;
        while (drop < this.timeline.length - 1 && this.timeline[drop] <= threshold) {
            drop++;
        }
        if (drop > 0) {
            this.timeline.splice(0, drop);
            this.values.splice(0, drop);
        }
        return drop;
    }

    snapshot(): CpuLoadSnapshot {
        return {timeline: this.timeline.slice(), values: this.values.slice()};
    }

    stats(): CpuLoadStats {
        const n = this.values.length;
        if (n === 0) {
            return {current: null, average: null, max: null, points: 0};
        }
        let sum = 0;
        let max = -Infinity;
        for (let i = 0; i < n; i++) {
            const v = this.values[i];
            sum += v;
            if (v > max) max = v;
        }
        return {current: this.values[n - 1], average: sum / n, max, points: n};
    }
}

/* ------------------------------------------------------------------ */
/* Симулятор: детерминированный, похожий на реальную загрузку CPU      */
/* ------------------------------------------------------------------ */

/** Небольшой seeded PRNG (mulberry32), чтобы картинка была воспроизводимой. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/** Генератор следующего значения: суточная волна + авторегрессионный шум + редкие всплески. */
export function createCpuLoadModel(seed = 42) {
    const rnd = mulberry32(seed);
    let noise = 0;
    let spike = 0;

    const gauss = () => {
        // Бокс–Мюллер
        const u = Math.max(rnd(), 1e-12);
        const v = rnd();
        return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    };

    return (ts: number): number => {
        const hour = (ts / 3_600_000) % 24;
        const diurnal = 32 + 18 * Math.sin(((hour - 8) / 24) * 2 * Math.PI);

        noise = 0.92 * noise + gauss() * 2.2;

        if (spike < 0.5 && rnd() < 0.0015) {
            spike = 25 + rnd() * 45;
        } else {
            spike *= 0.965;
        }

        const value = diurnal + noise + spike;
        return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
    };
}

export interface SimulatedCpuLoadOptions {
    /** Длительность окна, мс (по умолчанию сутки) */
    windowMs?: number;
    /** Шаг между точками, мс (по умолчанию 2 с → 43 200 точек в сутках) */
    intervalMs?: number;
    /** «Сейчас» для генерации истории (по умолчанию Date.now()) */
    now?: number;
    seed?: number;
}

/**
 * Источник с предзаполненной историей за окно и живыми обновлениями раз в intervalMs.
 * При троттлинге таймеров в фоновой вкладке догоняет отставание одной порцией,
 * так что сетка времени остаётся равномерной.
 */
export function createSimulatedCpuLoadSource(options: SimulatedCpuLoadOptions = {}): CpuLoadSource {
    const {windowMs = DAY_MS, intervalMs = 2 * SECOND_MS, seed = 42} = options;
    const buffer = new SlidingWindowBuffer(windowMs);
    const next = createCpuLoadModel(seed);
    const listeners = new Set<CpuLoadListener>();

    const now = options.now ?? Date.now();
    const start = now - windowMs + intervalMs;
    let lastTs = Math.floor(start / intervalMs) * intervalMs;

    // История за окно.
    for (let ts = lastTs; ts <= now; ts += intervalMs) {
        buffer.push(ts, next(ts));
        lastTs = ts;
    }

    const tick = () => {
        const current = Date.now();
        if (current - lastTs < intervalMs) return;

        const timeline: number[] = [];
        const values: number[] = [];
        let dropped = 0;
        for (let ts = lastTs + intervalMs; ts <= current; ts += intervalMs) {
            const value = next(ts);
            dropped += buffer.push(ts, value);
            timeline.push(ts);
            values.push(value);
            lastTs = ts;
        }
        if (timeline.length === 0) return;

        const batch: CpuLoadBatch = {timeline, values, dropped};
        listeners.forEach((listener) => listener(batch));
    };

    let timer: ReturnType<typeof setInterval> | null = setInterval(tick, intervalMs);

    return {
        getSnapshot: () => buffer.snapshot(),
        getStats: () => buffer.stats(),
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        dispose() {
            if (timer !== null) {
                clearInterval(timer);
                timer = null;
            }
            listeners.clear();
        },
    };
}
