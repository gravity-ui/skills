export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_POINTS = 100_000;

export interface CpuSample {
  /** Unix timestamp in milliseconds. */
  timestamp: number;
  /** CPU utilization in percent; null represents a missing measurement. */
  value: number | null;
}

export interface CpuSource {
  loadHistory: (from: number, to: number, signal: AbortSignal) => Promise<readonly CpuSample[]>;
  /** Ordered samples, including corrections to the latest timestamp. Return an unsubscribe function. */
  subscribe: (
    onSamples: (samples: readonly CpuSample[]) => void,
    onError: (error: Error) => void,
  ) => () => void;
}

/** Constant-time appends/evictions with bounded memory, even in a hidden browser tab. */
export class CpuBuffer {
  private timestamps: Float64Array;
  private values: Float64Array;
  private start = 0;
  private length = 0;

  constructor(private capacity = MAX_POINTS) {
    this.timestamps = new Float64Array(capacity);
    this.values = new Float64Array(capacity);
  }

  append(samples: readonly CpuSample[], now: number) {
    this.prune(now);
    for (const sample of samples) {
      if (!Number.isFinite(sample.timestamp) || sample.timestamp < now - DAY_MS ||
          sample.timestamp > now || (sample.value !== null &&
          (!Number.isFinite(sample.value) || sample.value < 0 || sample.value > 100))) continue;

      const last = (this.start + this.length - 1) % this.capacity;
      if (this.length && sample.timestamp < this.timestamps[last]) continue;
      if (this.length && sample.timestamp === this.timestamps[last]) {
        this.values[last] = sample.value ?? NaN;
        continue;
      }
      const index = (this.start + this.length) % this.capacity;
      this.timestamps[index] = sample.timestamp;
      this.values[index] = sample.value ?? NaN;
      if (this.length === this.capacity) this.start = (this.start + 1) % this.capacity;
      else this.length++;
    }
  }

  prune(now: number) {
    const previousLength = this.length;
    while (this.length && this.timestamps[this.start] < now - DAY_MS) {
      this.start = (this.start + 1) % this.capacity;
      this.length--;
    }
    return this.length !== previousLength;
  }

  snapshot() {
    const timeline: number[] = new Array(this.length);
    const values: (number | null)[] = new Array(this.length);
    let sum = 0;
    let count = 0;
    let max: number | null = null;
    for (let i = 0; i < this.length; i++) {
      const index = (this.start + i) % this.capacity;
      timeline[i] = this.timestamps[index];
      const value = this.values[index];
      values[i] = Number.isNaN(value) ? null : value;
      if (!Number.isNaN(value)) {
        sum += value;
        count++;
        max = Math.max(max ?? 0, value);
      }
    }
    return {
      timeline,
      values,
      count,
      current: values.at(-1) ?? null,
      average: count ? sum / count : null,
      max,
    };
  }
}
