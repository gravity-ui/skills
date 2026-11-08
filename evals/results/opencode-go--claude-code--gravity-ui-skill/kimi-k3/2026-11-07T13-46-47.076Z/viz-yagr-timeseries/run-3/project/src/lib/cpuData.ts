/**
 * Simulated CPU telemetry source: a sliding 24h window at 1s resolution
 * (86 400 points) with a new sample appended every second.
 *
 * The module only produces data; the chart component owns the window
 * lifecycle (append newest sample, drop the oldest one).
 */

export interface CpuSeries {
    /** Timestamps, ms */
    timeline: number[];
    /** CPU load, % (0..100) */
    values: number[];
}

/** Seconds in 24h — the chart window length at 1s resolution. */
export const WINDOW_SECONDS = 24 * 60 * 60;
/** Realtime tick interval, ms. */
export const TICK_MS = 1000;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/**
 * Random walk with mean reversion towards a daily cycle
 * (busier in the middle of the day, quieter at night) plus rare spikes.
 */
export function nextCpuValue(prev: number, timeMs: number): number {
    const date = new Date(timeMs);
    const hours = date.getHours() + date.getMinutes() / 60;
    const dailyBaseline = 35 + 25 * Math.sin(((hours - 9) / 24) * Math.PI * 2);
    const reverted = prev + (dailyBaseline - prev) * 0.002;
    const noise = (Math.random() - 0.5) * 2.2;
    const spike = Math.random() < 0.002 ? Math.random() * 25 : 0;
    return clamp(reverted + noise + spike, 0.5, 99.5);
}

/** Generates the initial 24h of history ending at `nowMs`. */
export function createInitialSeries(nowMs: number): CpuSeries {
    const timeline = new Array<number>(WINDOW_SECONDS);
    const values = new Array<number>(WINDOW_SECONDS);
    const start = nowMs - (WINDOW_SECONDS - 1) * TICK_MS;

    let value = 30 + Math.random() * 20;
    for (let i = 0; i < WINDOW_SECONDS; i++) {
        const t = start + i * TICK_MS;
        value = nextCpuValue(value, t);
        timeline[i] = t;
        values[i] = Math.round(value * 10) / 10;
    }

    return {timeline, values};
}
