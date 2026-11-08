/** Column-oriented time series: avoids allocating an object per point. */
export interface CpuSeries {
    /** Unix time in milliseconds, strictly increasing. */
    timestamps: number[];
    /** CPU load in percent; `null` marks a gap in the metric. */
    values: (number | null)[];
}

export const emptySeries = (): CpuSeries => ({timestamps: [], values: []});

/** Index of the first element `>= value` in a sorted array. */
export function lowerBound(sorted: ArrayLike<number>, value: number): number {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (sorted[mid] < value) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

/** Index of the first element `> value` in a sorted array. */
export function upperBound(sorted: ArrayLike<number>, value: number): number {
    let lo = 0;
    let hi = sorted.length;
    while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (sorted[mid] <= value) {
            lo = mid + 1;
        } else {
            hi = mid;
        }
    }
    return lo;
}

/**
 * Accumulates live samples between redraws so that a burst of messages costs
 * a single chart update. Samples that are not newer than the latest accepted
 * one are dropped: inserting into the middle of the series would force a full
 * re-render. Memory is bounded by the visible window.
 */
export class PendingSamples {
    private timestamps: number[] = [];
    private values: (number | null)[] = [];

    constructor(private readonly windowMs: number) {}

    get size() {
        return this.timestamps.length;
    }

    push({timestamps, values}: CpuSeries) {
        let last = this.timestamps.length ? this.timestamps[this.timestamps.length - 1] : -Infinity;
        for (let i = 0; i < timestamps.length; i++) {
            const t = timestamps[i];
            if (t > last) {
                this.timestamps.push(t);
                this.values.push(values[i]);
                last = t;
            }
        }

        // A hidden tab may skip redraws for hours: keep only what can still be shown.
        const drop = lowerBound(this.timestamps, last - this.windowMs);
        if (drop > 0) {
            this.timestamps.splice(0, drop);
            this.values.splice(0, drop);
        }
    }

    /** Returns and clears samples newer than `after`. */
    take(after: number): CpuSeries {
        const from = upperBound(this.timestamps, after);
        const result = {
            timestamps: this.timestamps.slice(from),
            values: this.values.slice(from),
        };
        this.timestamps = [];
        this.values = [];
        return result;
    }
}

/** Keeps the last `windowMs` of a series relative to its newest point. */
export function trimToWindow(series: CpuSeries, windowMs: number): CpuSeries {
    const {timestamps, values} = series;
    if (!timestamps.length) {
        return series;
    }
    const from = lowerBound(timestamps, timestamps[timestamps.length - 1] - windowMs);
    return from === 0 ? series : {timestamps: timestamps.slice(from), values: values.slice(from)};
}
