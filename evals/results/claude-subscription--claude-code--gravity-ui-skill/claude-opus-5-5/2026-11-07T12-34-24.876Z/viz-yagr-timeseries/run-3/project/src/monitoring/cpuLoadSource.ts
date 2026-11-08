/**
 * Data source contract for the CPU load chart.
 *
 * The chart only depends on this interface, so the mock below can be replaced with a real
 * HTTP + WebSocket/SSE implementation without touching the chart component.
 */
export interface CpuLoadBatch {
    /** Unix timestamps in milliseconds, strictly ascending. */
    timeline: number[];
    /** CPU load in percent (0..100), same length as `timeline`. */
    values: number[];
}

export interface CpuLoadSource {
    /** Loads historical samples within `[from, to]` (ms). */
    loadHistory(from: number, to: number, signal: AbortSignal): Promise<CpuLoadBatch>;
    /** Subscribes to live samples. Returns an unsubscribe function. */
    subscribe(onBatch: (batch: CpuLoadBatch) => void): () => void;
}

/** Deterministic pseudo-random generator, so history and live data join seamlessly. */
function noise(seed: number) {
    const x = Math.sin(seed * 12.9898) * 43758.5453;
    return x - Math.floor(x);
}

function sampleAt(timestamp: number, stepMs: number) {
    const index = Math.floor(timestamp / stepMs);
    const dayPhase = ((timestamp % 86_400_000) / 86_400_000) * Math.PI * 2;
    // Daily pattern: low at night, peak during the day.
    const daily = 35 - 20 * Math.cos(dayPhase - Math.PI / 6);
    // Slow drift over ~10 minutes and fast jitter.
    const drift = 8 * Math.sin(index / 300) + 4 * Math.sin(index / 47);
    const jitter = (noise(index) - 0.5) * 10;
    // Occasional short spikes.
    const spike = noise(Math.floor(index / 30) + 0.5) > 0.985 ? 40 * noise(index + 0.25) : 0;
    const value = daily + drift + jitter + spike;
    return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

/**
 * Mock CPU load source: one sample every `stepMs` (2 s by default → 43 200 points per day).
 */
export function createMockCpuLoadSource(stepMs = 2000): CpuLoadSource {
    return {
        loadHistory(from, to, signal) {
            return new Promise((resolve, reject) => {
                const timer = window.setTimeout(() => {
                    const timeline: number[] = [];
                    const values: number[] = [];
                    for (let ts = Math.ceil(from / stepMs) * stepMs; ts <= to; ts += stepMs) {
                        timeline.push(ts);
                        values.push(sampleAt(ts, stepMs));
                    }
                    resolve({timeline, values});
                }, 300); // simulated network latency

                signal.addEventListener(
                    'abort',
                    () => {
                        window.clearTimeout(timer);
                        reject(new DOMException('Aborted', 'AbortError'));
                    },
                    {once: true},
                );
            });
        },

        subscribe(onBatch) {
            const id = window.setInterval(() => {
                const ts = Math.floor(Date.now() / stepMs) * stepMs;
                onBatch({timeline: [ts], values: [sampleAt(ts, stepMs)]});
            }, stepMs);

            return () => window.clearInterval(id);
        },
    };
}
