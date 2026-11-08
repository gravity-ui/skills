import type {CpuLoadSource, CpuSample, CpuWindow} from './types';

const DAY_MS = 24 * 60 * 60 * 1000;

export interface MockCpuSourceOptions {
    /** Interval between samples, ms. */
    stepMs?: number;
    /** Length of the displayed window, ms. */
    windowMs?: number;
}

/**
 * Simulated CPU load: a mean-reverting random walk with a slow daily cycle.
 *
 * Stands in for a real metrics backend. Replace it with a WebSocket/SSE-backed
 * implementation of `CpuLoadSource` without touching the chart.
 */
export function createMockCpuSource({
    stepMs = 2000,
    windowMs = DAY_MS,
}: MockCpuSourceOptions = {}): CpuLoadSource {
    const pointCount = Math.floor(windowMs / stepMs);
    const listeners = new Set<(sample: CpuSample) => void>();
    let timer: ReturnType<typeof setInterval> | null = null;
    let level = 40;
    let lastTime = 0;

    function nextSample(time: number): CpuSample {
        const target = 40 + 15 * Math.sin((2 * Math.PI * time) / DAY_MS);
        level += (target - level) * 0.05 + (Math.random() - 0.5) * 6;
        level = Math.min(100, Math.max(0, level));
        return {time, value: level};
    }

    function tick() {
        // Never fall behind the wall clock, but never emit two samples with the same timestamp.
        const time = Math.max(lastTime + stepMs, Math.floor(Date.now() / stepMs) * stepMs);
        lastTime = time;
        const sample = nextSample(time);
        for (const listener of listeners) {
            listener(sample);
        }
    }

    return {
        snapshot(): CpuWindow {
            const end = Math.floor(Date.now() / stepMs) * stepMs;
            const timeline: number[] = new Array(pointCount);
            const values: number[] = new Array(pointCount);
            for (let i = 0; i < pointCount; i++) {
                const time = end - (pointCount - 1 - i) * stepMs;
                timeline[i] = time;
                values[i] = nextSample(time).value;
            }
            lastTime = end;
            return {timeline, values};
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
