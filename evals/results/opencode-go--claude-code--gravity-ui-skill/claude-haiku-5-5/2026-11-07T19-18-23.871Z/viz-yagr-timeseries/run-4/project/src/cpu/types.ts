/** One CPU load measurement: `time` in epoch milliseconds, `value` in percent (0–100). */
export interface CpuSample {
    time: number;
    value: number;
}

/** Sliding window as parallel arrays, oldest point first. */
export interface CpuWindow {
    timeline: number[];
    values: number[];
}

/**
 * Source of CPU load data.
 *
 * The chart keeps a sliding window of `snapshot().timeline.length` points: every sample
 * delivered through `subscribe` is appended and the oldest point is dropped.
 */
export interface CpuLoadSource {
    /** Current window (typically the last 24 hours of history). */
    snapshot(): CpuWindow;
    /**
     * Starts delivering new samples to `listener`.
     * Returns an unsubscribe function; the source should release its timers/sockets
     * once the last listener has gone.
     */
    subscribe(listener: (sample: CpuSample) => void): () => void;
}
