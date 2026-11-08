import type {CpuSeries} from './series';

export interface CpuLoadSource {
    /** Loads samples in `[from, to]`, sorted by time. */
    fetchHistory(from: number, to: number, signal: AbortSignal): Promise<CpuSeries>;
    /** Streams new samples; returns an unsubscribe function. */
    subscribe(onSamples: (samples: CpuSeries) => void): () => void;
}

export const MINUTE = 60 * 1000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

interface MockOptions {
    /** Distance between samples, ms. */
    stepMs?: number;
}

/**
 * Demo source: one sample per second → ~86 400 points per day.
 * The load follows a daily cycle with noise, short spikes and a rare gap,
 * so the chart has something to zoom into.
 */
export function createMockCpuSource({stepMs = 1000}: MockOptions = {}): CpuLoadSource {
    const valueAt = (t: number) => {
        const hours = (t / HOUR) % 24;
        const daily = 35 + 20 * Math.sin(((hours - 9) / 24) * 2 * Math.PI);
        const wave = 6 * Math.sin(t / 97_000) + 3 * Math.sin(t / 13_000);
        const noise = (pseudoRandom(t) - 0.5) * 10;
        const spike = pseudoRandom(Math.floor(t / 600_000)) > 0.93 ? 30 * pseudoRandom(t + 1) : 0;
        return clamp(Math.round((daily + wave + noise + spike) * 10) / 10, 0, 100);
    };
    // ~2% of 5-minute buckets have no data — rendered as gaps.
    const isGap = (t: number) => pseudoRandom(Math.floor(t / 300_000) + 7) > 0.98;

    const generate = (from: number, to: number): CpuSeries => {
        const timestamps: number[] = [];
        const values: (number | null)[] = [];
        for (let t = Math.ceil(from / stepMs) * stepMs; t <= to; t += stepMs) {
            timestamps.push(t);
            values.push(isGap(t) ? null : valueAt(t));
        }
        return {timestamps, values};
    };

    return {
        fetchHistory(from, to, signal) {
            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => resolve(generate(from, to)), 300);
                signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(signal.reason);
                });
            });
        },
        subscribe(onSamples) {
            let last = Math.floor(Date.now() / stepMs) * stepMs;
            const timer = setInterval(() => {
                const now = Date.now();
                if (now - last >= stepMs) {
                    onSamples(generate(last + 1, now));
                    last = Math.floor(now / stepMs) * stepMs;
                }
            }, stepMs);
            return () => clearInterval(timer);
        },
    };
}

function pseudoRandom(seed: number) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
