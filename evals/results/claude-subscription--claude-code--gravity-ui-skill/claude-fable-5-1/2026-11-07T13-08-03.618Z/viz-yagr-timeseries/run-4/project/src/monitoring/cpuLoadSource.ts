/**
 * Источник данных о загрузке CPU.
 *
 * Интерфейс `CpuLoadSource` отделяет график от транспорта: сейчас используется
 * имитация (случайное блуждание с суточным паттерном), в проде на его место
 * встаёт WebSocket / SSE / поллинг с тем же контрактом.
 */

export interface CpuLoadPoint {
    /** Метка времени, мс (Unix epoch) */
    ts: number;
    /** Загрузка CPU, 0..100 % */
    value: number;
}

export interface CpuLoadSnapshot {
    timeline: number[];
    values: number[];
}

export interface CpuLoadSource {
    /** Шаг между точками, мс */
    readonly stepMs: number;
    /** Длина скользящего окна, мс */
    readonly windowMs: number;
    /** Текущее состояние окна целиком. Массивы — копии, их можно отдавать в график как есть. */
    getSnapshot(): CpuLoadSnapshot;
    /** Последняя точка (для счётчиков и статусов) */
    getLatest(): CpuLoadPoint | null;
    /** Подписка на новые точки. Возвращает функцию отписки. */
    subscribe(listener: (point: CpuLoadPoint) => void): () => void;
}

export interface MockCpuLoadSourceOptions {
    /** Шаг между точками, мс (по умолчанию 2 с → 43 200 точек на сутки) */
    stepMs?: number;
    /** Длина окна, мс (по умолчанию сутки) */
    windowMs?: number;
    /** Сид генератора, чтобы история была воспроизводимой */
    seed?: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function createRng(seed: number) {
    let s = seed >>> 0 || 1;
    return () => {
        // mulberry32
        s = (s + 0x6d2b79f5) >>> 0;
        let t = s;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(v: number, min: number, max: number) {
    return v < min ? min : v > max ? max : v;
}

/** Базовый суточный профиль нагрузки: ночью ниже, днём выше. */
function dailyBaseline(ts: number) {
    const hour = ((ts / 3_600_000) % 24 + 24) % 24;
    return 35 + 20 * Math.sin(((hour - 9) / 24) * Math.PI * 2);
}

/**
 * Имитация метрики CPU в реальном времени.
 * Точки генерируются только за прошедшее время, таймер привязан к сетке `stepMs`.
 */
export function createMockCpuLoadSource(options: MockCpuLoadSourceOptions = {}): CpuLoadSource {
    const stepMs = options.stepMs ?? 2_000;
    const windowMs = options.windowMs ?? DAY_MS;
    const capacity = Math.floor(windowMs / stepMs);
    const rng = createRng(options.seed ?? 42);

    const timeline: number[] = new Array(capacity);
    const values: number[] = new Array(capacity);

    let drift = 0;
    let spikeLeft = 0;

    const nextValue = (ts: number, prev: number) => {
        drift = clamp(drift + (rng() - 0.5) * 1.2, -12, 12);
        if (spikeLeft > 0) {
            spikeLeft -= 1;
        } else if (rng() < 0.002) {
            spikeLeft = Math.floor(5 + rng() * 40);
        }
        const spike = spikeLeft > 0 ? 25 + rng() * 15 : 0;
        const target = dailyBaseline(ts) + drift + spike;
        const next = prev + (target - prev) * 0.3 + (rng() - 0.5) * 3;
        return Math.round(clamp(next, 0, 100) * 10) / 10;
    };

    // Заполняем историю так, чтобы последняя точка лежала на сетке stepMs не позже "сейчас".
    const now = Date.now();
    let lastTs = Math.floor(now / stepMs) * stepMs;
    let prev = dailyBaseline(lastTs - windowMs);
    for (let i = 0; i < capacity; i++) {
        const ts = lastTs - (capacity - 1 - i) * stepMs;
        prev = nextValue(ts, prev);
        timeline[i] = ts;
        values[i] = prev;
    }

    const listeners = new Set<(point: CpuLoadPoint) => void>();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const push = (point: CpuLoadPoint) => {
        timeline.push(point.ts);
        values.push(point.value);
        if (timeline.length > capacity) {
            timeline.shift();
            values.shift();
        }
        listeners.forEach((listener) => listener(point));
    };

    const tick = () => {
        timer = null;
        const target = Math.floor(Date.now() / stepMs) * stepMs;
        // Если вкладка была в фоне и таймер «проспал», догоняем сетку несколькими точками.
        while (lastTs < target) {
            lastTs += stepMs;
            prev = nextValue(lastTs, prev);
            push({ts: lastTs, value: prev});
        }
        schedule();
    };

    const schedule = () => {
        if (timer !== null || listeners.size === 0) {
            return;
        }
        const delay = Math.max(0, lastTs + stepMs - Date.now());
        timer = setTimeout(tick, delay);
    };

    const stop = () => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    return {
        stepMs,
        windowMs,
        getSnapshot: () => ({timeline: timeline.slice(), values: values.slice()}),
        getLatest: () => {
            const idx = timeline.length - 1;
            return idx < 0 ? null : {ts: timeline[idx], value: values[idx]};
        },
        subscribe: (listener) => {
            listeners.add(listener);
            schedule();
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    stop();
                }
            };
        },
    };
}
