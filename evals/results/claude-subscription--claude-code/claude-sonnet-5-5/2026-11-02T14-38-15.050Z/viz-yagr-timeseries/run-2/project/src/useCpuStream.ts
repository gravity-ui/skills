import React from 'react';

export const HOUR_MS = 60 * 60 * 1000;
export const WINDOW_MS = 24 * HOUR_MS;
/** One sample every 2 s -> 43 200 points per 24 h. */
export const STEP_MS = 2000;

/** Deterministic pseudo-random in [0, 1) so the demo history is stable between ticks. */
function hash(n: number): number {
    const x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

/** Synthetic CPU load (%) at `ts`: daily rhythm + slow waves + noise + occasional bursts. */
export function sampleCpu(ts: number): number {
    const slot = Math.floor(ts / STEP_MS);
    const day = Math.sin(((ts % (24 * HOUR_MS)) / (24 * HOUR_MS)) * Math.PI * 2 - 2);
    const wave = Math.sin(ts / 420_000) * 8 + Math.sin(ts / 53_000) * 4;
    const noise = (hash(slot) - 0.5) * 10;
    const burstSeed = hash(Math.floor(ts / (7 * 60_000)));
    const burst = burstSeed > 0.82 ? (burstSeed - 0.82) * 260 * hash(slot + 1) : 0;
    return Math.min(100, Math.max(0, 38 + day * 14 + wave + noise + burst));
}

export interface CpuStream {
    timeline: number[];
    values: number[];
}

function createHistory(now: number): CpuStream {
    const last = Math.floor(now / STEP_MS) * STEP_MS;
    const count = WINDOW_MS / STEP_MS;
    const timeline = new Array<number>(count);
    const values = new Array<number>(count);
    for (let i = 0; i < count; i++) {
        const ts = last - (count - 1 - i) * STEP_MS;
        timeline[i] = ts;
        values[i] = sampleCpu(ts);
    }
    return {timeline, values};
}

/**
 * Stand-in for a real metrics source: the last 24 h of history up front, then a new sample
 * every STEP_MS while the oldest one leaves the window. Replace with your API/WebSocket.
 */
export function useCpuStream(): CpuStream {
    const [data, setData] = React.useState(() => createHistory(Date.now()));

    React.useEffect(() => {
        const id = window.setInterval(() => {
            setData((prev) => {
                // Catch up if timers were throttled (background tab): append every missed slot.
                const last = prev.timeline[prev.timeline.length - 1];
                const missed = Math.max(1, Math.floor((Date.now() - last) / STEP_MS));
                const k = Math.min(missed, prev.timeline.length);
                const timeline = prev.timeline.slice(k);
                const values = prev.values.slice(k);
                for (let i = 1; i <= k; i++) {
                    const ts = last + i * STEP_MS;
                    timeline.push(ts);
                    values.push(sampleCpu(ts));
                }
                return {timeline, values};
            });
        }, STEP_MS);
        return () => window.clearInterval(id);
    }, []);

    return data;
}
