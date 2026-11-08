/**
 * Источник данных о загрузке CPU.
 *
 * Интерфейс намеренно минимален: история для первоначальной отрисовки и
 * подписка на новые точки. Реальный транспорт (WebSocket, SSE, polling)
 * подставляется вместо `createSimulatedCpuLoadSource` без изменений в графике.
 */

export interface CpuLoadPoint {
    /** Метка времени, мс */
    ts: number;
    /** Загрузка, % (0–100) */
    value: number;
}

export interface CpuLoadHistory {
    timeline: number[];
    values: number[];
}

export interface CpuLoadSource {
    /** Окно истории, мс */
    readonly windowMs: number;
    /** История за окно на момент вызова */
    getHistory(): CpuLoadHistory;
    /** Подписка на новые точки; возвращает функцию отписки */
    subscribe(listener: (points: CpuLoadPoint[]) => void): () => void;
}

export interface SimulatedCpuLoadSourceOptions {
    /** Размер окна истории, мс (по умолчанию 24 часа) */
    windowMs?: number;
    /** Шаг между точками, мс (по умолчанию 2 секунды) */
    stepMs?: number;
    /** Зерно генератора, чтобы история была воспроизводимой */
    seed?: number;
}

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

/** Детерминированный PRNG (mulberry32) */
function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function clamp(value: number, min: number, max: number): number {
    return value < min ? min : value > max ? max : value;
}

/**
 * Генератор правдоподобной загрузки CPU: суточная волна + медленный дрейф +
 * шум + редкие всплески. Состояние хранится между вызовами, поэтому новые точки
 * продолжают историю без разрывов.
 */
function createCpuModel(seed: number) {
    const random = createRandom(seed);
    let drift = 0;
    let spike = 0;

    return (ts: number): number => {
        const hour = (ts % DAY_MS) / HOUR_MS;
        const daily = 38 + 18 * Math.sin(((hour - 9) / 24) * Math.PI * 2);

        drift = clamp(drift + (random() - 0.5) * 1.2, -12, 12);

        if (spike > 0) {
            spike *= 0.9;
        } else if (random() < 0.0015) {
            spike = 25 + random() * 30;
        }

        const noise = (random() - 0.5) * 6;
        const value = daily + drift + spike + noise;
        return Math.round(clamp(value, 1, 100) * 10) / 10;
    };
}

export function createSimulatedCpuLoadSource(
    options: SimulatedCpuLoadSourceOptions = {},
): CpuLoadSource {
    const windowMs = options.windowMs ?? DAY_MS;
    const stepMs = options.stepMs ?? 2000;
    const nextValue = createCpuModel(options.seed ?? 20251107);

    const pointsCount = Math.floor(windowMs / stepMs);
    const timeline: number[] = new Array(pointsCount);
    const values: number[] = new Array(pointsCount);

    // Выравниваем сетку по шагу, чтобы новые точки ложились ровно на неё.
    let lastTs = Math.floor(Date.now() / stepMs) * stepMs;
    const firstTs = lastTs - (pointsCount - 1) * stepMs;
    for (let i = 0; i < pointsCount; i++) {
        const ts = firstTs + i * stepMs;
        timeline[i] = ts;
        values[i] = nextValue(ts);
    }

    const listeners = new Set<(points: CpuLoadPoint[]) => void>();
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
        // Догоняем «текущее время» на случай, если таймер отставал
        // (например, вкладка была в фоне и браузер троттлил интервалы).
        const now = Date.now();
        const fresh: CpuLoadPoint[] = [];
        while (lastTs + stepMs <= now) {
            lastTs += stepMs;
            const value = nextValue(lastTs);
            fresh.push({ts: lastTs, value});
            timeline.push(lastTs);
            values.push(value);
        }
        if (fresh.length === 0) {
            return;
        }
        // Держим историю в пределах окна.
        const overflow = timeline.length - pointsCount;
        if (overflow > 0) {
            timeline.splice(0, overflow);
            values.splice(0, overflow);
        }
        listeners.forEach((listener) => listener(fresh));
    };

    return {
        windowMs,
        getHistory() {
            return {timeline: timeline.slice(), values: values.slice()};
        },
        subscribe(listener) {
            listeners.add(listener);
            if (timer === null) {
                timer = setInterval(tick, stepMs);
            }
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0 && timer !== null) {
                    clearInterval(timer);
                    timer = null;
                }
            };
        },
    };
}
