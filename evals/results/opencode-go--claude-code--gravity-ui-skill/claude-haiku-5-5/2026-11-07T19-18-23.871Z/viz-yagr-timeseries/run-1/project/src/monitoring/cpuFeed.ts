/**
 * Source of CPU load samples for the monitoring page.
 *
 * The project has no backend, so this is a simulated feed: a sample every
 * CPU_STEP_MS, a sliding window of the last 24 hours. Replace the generator in
 * `nextValue` with a real stream, keeping the `snapshot` / `subscribe` contract.
 *
 * Timers run only while there are subscribers. When the feed is resumed after
 * an idle period it catches up with the missing samples, so the timeline has
 * no holes.
 */

export const CPU_STEP_MS = 2_000;
const DAY_MS = 24 * 60 * 60 * 1000;
/** Samples in the 24h window: 43 200 at a 2s step. */
const WINDOW_SIZE = DAY_MS / CPU_STEP_MS;

export interface CpuBatch {
    /** Sample times in ms, ascending. Never empty when delivered to a listener. */
    readonly timestamps: number[];
    /** CPU load in percent, aligned with `timestamps`. */
    readonly values: number[];
}

export type CpuListener = (batch: CpuBatch) => void;

function alignDown(ts: number): number {
    return Math.floor(ts / CPU_STEP_MS) * CPU_STEP_MS;
}

/** Seeded PRNG (mulberry32), so the simulated history is reproducible. */
function createRandom(seed: number): () => number {
    let state = seed >>> 0;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

class CpuFeed {
    private readonly timestamps: number[] = [];
    private readonly values: number[] = [];
    private readonly listeners = new Set<CpuListener>();
    private readonly clock: () => number = Date.now;
    private readonly random = createRandom(7);
    private noise = 0;
    private spike = 0;
    private timer: ReturnType<typeof setInterval> | undefined;

    constructor() {
        const end = alignDown(this.clock());
        for (let ts = end - (WINDOW_SIZE - 1) * CPU_STEP_MS; ts <= end; ts += CPU_STEP_MS) {
            this.timestamps.push(ts);
            this.values.push(this.nextValue(ts));
        }
    }

    /** Copy of the current window. Does not advance the feed or touch listeners. */
    snapshot(): { timestamps: number[]; values: number[] } {
        return { timestamps: this.timestamps.slice(), values: this.values.slice() };
    }

    /**
     * Subscribes to new samples. The listener first receives every sample with
     * `timestamp > sinceTimestamp` that is already in the window (catch-up),
     * then one batch per tick. Returns the unsubscribe function.
     */
    subscribe(sinceTimestamp: number, listener: CpuListener): () => void {
        const caught = this.advance();
        if (caught) {
            this.emit(caught);
        }

        this.listeners.add(listener);
        if (this.timer === undefined) {
            this.timer = setInterval(this.tick, CPU_STEP_MS);
        }

        const tail = this.tailAfter(sinceTimestamp);
        if (tail) {
            listener(tail);
        }

        return () => {
            this.listeners.delete(listener);
            if (this.listeners.size === 0 && this.timer !== undefined) {
                clearInterval(this.timer);
                this.timer = undefined;
            }
        };
    }

    private readonly tick = (): void => {
        const batch = this.advance();
        if (batch) {
            this.emit(batch);
        }
    };

    private emit(batch: CpuBatch): void {
        for (const listener of this.listeners) {
            listener(batch);
        }
    }

    /** Generates samples up to the current aligned time and trims the window. */
    private advance(): CpuBatch | undefined {
        const target = alignDown(this.clock());
        const last = this.timestamps[this.timestamps.length - 1];
        // After a long pause, generate only what fits in the window.
        const from = Math.max(last + CPU_STEP_MS, target - (WINDOW_SIZE - 1) * CPU_STEP_MS);

        const timestamps: number[] = [];
        const values: number[] = [];
        for (let ts = from; ts <= target; ts += CPU_STEP_MS) {
            const value = this.nextValue(ts);
            timestamps.push(ts);
            values.push(value);
            this.timestamps.push(ts);
            this.values.push(value);
        }
        if (timestamps.length === 0) {
            return undefined;
        }

        const excess = this.timestamps.length - WINDOW_SIZE;
        if (excess > 0) {
            this.timestamps.splice(0, excess);
            this.values.splice(0, excess);
        }
        return { timestamps, values };
    }

    /** Samples strictly newer than `sinceTimestamp`, or undefined if there are none. */
    private tailAfter(sinceTimestamp: number): CpuBatch | undefined {
        let start = this.timestamps.length;
        while (start > 0 && this.timestamps[start - 1] > sinceTimestamp) {
            start--;
        }
        if (start === this.timestamps.length) {
            return undefined;
        }
        return {
            timestamps: this.timestamps.slice(start),
            values: this.values.slice(start),
        };
    }

    /** Simulated load: daily cycle + AR(1) noise + occasional decaying spikes. */
    private nextValue(ts: number): number {
        const daily = 18 * Math.sin((2 * Math.PI * ts) / DAY_MS);
        this.noise = this.noise * 0.92 + (this.random() - 0.5) * 6;
        if (this.random() < 0.004) {
            this.spike = 30 + this.random() * 40;
        }
        this.spike *= 0.9;
        const raw = 32 + daily + this.noise + this.spike;
        return Math.min(100, Math.max(0, Math.round(raw * 10) / 10));
    }
}

export const cpuFeed = new CpuFeed();
