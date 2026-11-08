export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_POINTS = 100_000;

export interface CpuSample {
  /** Unix timestamp in milliseconds; incoming batches must be chronological. */
  timestamp: number;
  value: number;
}

/** Bounded ring: constant-time insertion and expiry, no shifting large arrays. */
export class CpuBuffer {
  private times: Float64Array;
  private values: Float64Array;
  private head = 0;
  private count = 0;

  constructor(private capacity = MAX_POINTS) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.times = new Float64Array(capacity);
    this.values = new Float64Array(capacity);
  }

  append(samples: readonly CpuSample[], now: number) {
    this.expire(now);
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || !Number.isFinite(value) || value < 0 || value > 100 ||
        timestamp < now - DAY_MS || timestamp > now) continue;
      const last = (this.head + this.count - 1) % this.capacity;
      if (this.count && timestamp < this.times[last]) continue;
      if (this.count && timestamp === this.times[last]) {
        this.values[last] = value;
        continue;
      }
      if (this.count === this.capacity) {
        this.head = (this.head + 1) % this.capacity;
        this.count--;
      }
      const index = (this.head + this.count++) % this.capacity;
      this.times[index] = timestamp;
      this.values[index] = value;
    }
  }

  expire(now: number) {
    const before = this.count;
    while (this.count && this.times[this.head] < now - DAY_MS) {
      this.head = (this.head + 1) % this.capacity;
      this.count--;
    }
    return before !== this.count;
  }

  snapshot() {
    const timeline = new Array<number>(this.count);
    const data = new Array<number>(this.count);
    let sum = 0;
    let peak = 0;
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      timeline[i] = this.times[index];
      data[i] = this.values[index];
      sum += data[i];
      peak = Math.max(peak, data[i]);
    }
    return {timeline, data, count: this.count, current: data.at(-1),
      average: this.count ? sum / this.count : undefined, peak: this.count ? peak : undefined};
  }
}
