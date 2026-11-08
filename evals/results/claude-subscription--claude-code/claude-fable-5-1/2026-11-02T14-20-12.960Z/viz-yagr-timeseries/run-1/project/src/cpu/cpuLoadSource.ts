import {DAY_MS, countExpired} from './window';

/** Одно измерение загрузки CPU: момент времени (мс) и загрузка в процентах 0–100. */
export interface CpuSample {
    ts: number;
    load: number;
}

/** История за окно наблюдения. Массивы живые — не мутировать, копировать при необходимости. */
export interface CpuLoadSnapshot {
    timeline: readonly number[];
    values: readonly number[];
}

/**
 * Источник данных для графика. Реальная реализация может оборачивать WebSocket или
 * SSE-поток — графику важны только этот интерфейс и упорядоченность точек по времени.
 */
export interface CpuLoadSource {
    getSnapshot(): CpuLoadSnapshot;
    subscribe(listener: (sample: CpuSample) => void): () => void;
}

export interface MockCpuLoadSourceOptions {
    /** Размер окна истории (по умолчанию сутки). */
    windowMs?: number;
    /** Период между точками (по умолчанию 2 с → 43 201 точка на сутки). */
    intervalMs?: number;
    /** Источник текущего времени (для тестов). */
    now?: () => number;
    /** Зерно генератора, чтобы история была воспроизводимой. */
    seed?: number;
}

export interface MockCpuLoadSource extends CpuLoadSource {
    dispose(): void;
}

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

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Суточная волна + медленный дрейф + редкие всплески + шум. */
function createLoadGenerator(seed: number) {
    const rand = mulberry32(seed);
    let drift = 0;
    let spike = 0;
    return (ts: number): number => {
        const hour = (ts % DAY_MS) / 3_600_000;
        const daily = 38 + 14 * Math.sin(((hour - 8) / 24) * Math.PI * 2);
        drift = clamp(drift + (rand() - 0.5) * 1.5, -12, 12);
        if (spike > 0.5) {
            spike *= 0.93;
        } else {
            spike = rand() < 0.0015 ? 25 + rand() * 30 : 0;
        }
        const noise = (rand() - 0.5) * 4;
        return Math.round(clamp(daily + drift + spike + noise, 0, 100) * 10) / 10;
    };
}

/**
 * Имитация потока телеметрии: генерирует историю за окно и затем эмитит новую точку
 * каждые `intervalMs`. Таймер живёт только пока есть подписчики.
 */
export function createMockCpuLoadSource(options: MockCpuLoadSourceOptions = {}): MockCpuLoadSource {
    const {windowMs = DAY_MS, intervalMs = 2000, now = Date.now, seed = 42} = options;
    const timeline: number[] = [];
    const values: number[] = [];
    const listeners = new Set<(sample: CpuSample) => void>();
    const nextLoad = createLoadGenerator(seed);
    let timer: ReturnType<typeof setInterval> | null = null;

    const push = (ts: number, load: number) => {
        timeline.push(ts);
        values.push(load);
        const expired = countExpired(timeline, ts, windowMs);
        if (expired > 0) {
            timeline.splice(0, expired);
            values.splice(0, expired);
        }
    };

    const end = now();
    const count = Math.floor(windowMs / intervalMs) + 1;
    for (let i = count - 1; i >= 0; i--) {
        const ts = end - i * intervalMs;
        push(ts, nextLoad(ts));
    }

    const tick = () => {
        const ts = now();
        const sample: CpuSample = {ts, load: nextLoad(ts)};
        push(sample.ts, sample.load);
        listeners.forEach((listener) => listener(sample));
    };

    const stopTimer = () => {
        if (timer !== null) {
            clearInterval(timer);
            timer = null;
        }
    };

    return {
        getSnapshot: () => ({timeline, values}),
        subscribe(listener) {
            listeners.add(listener);
            if (timer === null) {
                timer = setInterval(tick, intervalMs);
            }
            return () => {
                listeners.delete(listener);
                if (listeners.size === 0) {
                    stopTimer();
                }
            };
        },
        dispose() {
            listeners.clear();
            stopTimer();
        },
    };
}
