/**
 * CPU load data source.
 *
 * The chart depends only on the `CpuLoadSource` interface, so the mock below can be
 * replaced by a real transport (WebSocket / SSE / polling) without touching the UI.
 */

/** Metric sampling step. CPU metrics are collected with a fixed step. */
export const SAMPLE_STEP_MS = 2_000;
/** Visible window: last 24 hours. */
export const WINDOW_MS = 24 * 60 * 60 * 1_000;
/** Number of points in a full window (43 200 for a 2 s step). */
export const WINDOW_POINTS = Math.round(WINDOW_MS / SAMPLE_STEP_MS);

export interface CpuLoadBatch {
    /** Timestamps in milliseconds, ascending. */
    timeline: number[];
    /** CPU load in percent (0–100); `null` means a missing sample. */
    values: (number | null)[];
}

export interface CpuLoadSource {
    /** Loads the last 24 hours of history. */
    loadHistory(signal: AbortSignal): Promise<CpuLoadBatch>;
    /**
     * Subscribes to new samples that come after the loaded history.
     * Samples may arrive in batches (for example, after a background tab wakes up).
     * Returns an unsubscribe function.
     */
    subscribe(onBatch: (batch: CpuLoadBatch) => void): () => void;
}

// ---------------------------------------------------------------------------
// Mock implementation
// ---------------------------------------------------------------------------

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Daily pattern: low at night, peak in the afternoon. */
function dailyBaseline(t: number) {
    const hour = new Date(t).getHours() + new Date(t).getMinutes() / 60;
    return 30 + 22 * Math.sin(((hour - 9) / 24) * 2 * Math.PI);
}

function createGenerator(random: () => number) {
    let value = 30;
    let spikeLeft = 0;
    let spikeLevel = 0;

    return (t: number): number | null => {
        // Rarely, a sample is lost: the gap shows up on the chart.
        if (random() < 0.0002) {
            return null;
        }
        if (spikeLeft === 0 && random() < 0.0004) {
            spikeLeft = 30 + Math.floor(random() * 300);
            spikeLevel = 80 + random() * 18;
        }
        const target = spikeLeft > 0 ? spikeLevel : dailyBaseline(t);
        if (spikeLeft > 0) {
            spikeLeft--;
        }
        value += (target - value) * 0.08 + (random() - 0.5) * 6;
        value = clamp(value, 0, 100);
        return Math.round(value * 10) / 10;
    };
}

/** Small deterministic PRNG (mulberry32) so the history looks the same between reloads. */
function mulberry32(seed: number) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let r = Math.imul(a ^ (a >>> 15), 1 | a);
        r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export function createMockCpuLoadSource(): CpuLoadSource {
    const next = createGenerator(mulberry32(42));
    let lastT: number | null = null;

    const generateUntil = (until: number): CpuLoadBatch => {
        const timeline: number[] = [];
        const values: (number | null)[] = [];
        if (lastT === null) {
            return {timeline, values};
        }
        for (let t = lastT + SAMPLE_STEP_MS; t <= until; t += SAMPLE_STEP_MS) {
            timeline.push(t);
            values.push(next(t));
            lastT = t;
        }
        return {timeline, values};
    };

    return {
        loadHistory(signal) {
            return new Promise((resolve, reject) => {
                // Emulates network latency.
                const timer = setTimeout(() => {
                    const now = Date.now();
                    const end = now - (now % SAMPLE_STEP_MS);
                    lastT = end - WINDOW_POINTS * SAMPLE_STEP_MS;
                    resolve(generateUntil(end));
                }, 400);
                signal.addEventListener('abort', () => {
                    clearTimeout(timer);
                    reject(signal.reason);
                });
            });
        },

        subscribe(onBatch) {
            // Catch-up generation: if the timer is throttled (background tab),
            // the next tick returns all missed samples in one batch.
            const timer = setInterval(() => {
                const batch = generateUntil(Date.now());
                if (batch.timeline.length) {
                    onBatch(batch);
                }
            }, SAMPLE_STEP_MS);
            return () => clearInterval(timer);
        },
    };
}
