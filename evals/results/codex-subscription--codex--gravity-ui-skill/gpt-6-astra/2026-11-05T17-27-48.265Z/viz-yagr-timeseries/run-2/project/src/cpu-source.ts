export const DAY_MS = 24 * 60 * 60 * 1000;

export interface CpuSample {
  /** Unix timestamp in milliseconds. */
  timestamp: number;
  /** CPU usage, 0–100; null denotes a missing measurement. */
  value: number | null;
}

export interface CpuSource {
  /** Emit history first, then ordered batches. Return transport cleanup. */
  subscribe(onSamples: (samples: readonly CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

/** Bounded storage: O(1) append, no array.shift or React state per sample. */
export class CpuBuffer {
  private timestamps: Float64Array;
  private values: (number | null)[];
  private head = 0;
  private length = 0;

  constructor(private capacity = 100_000) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.timestamps = new Float64Array(capacity);
    this.values = new Array(capacity);
  }

  append(samples: readonly CpuSample[], now: number) {
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || timestamp < now - DAY_MS || timestamp > now) continue;
      if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) continue;
      const last = (this.head + this.length - 1) % this.capacity;
      if (this.length && timestamp < this.timestamps[last]) continue;
      if (this.length && timestamp === this.timestamps[last]) {
        this.values[last] = value;
        continue;
      }
      const index = (this.head + this.length) % this.capacity;
      this.timestamps[index] = timestamp;
      this.values[index] = value;
      if (this.length === this.capacity) this.head = (this.head + 1) % this.capacity;
      else this.length++;
    }
  }

  snapshot(now: number): [number[], (number | null)[]] {
    while (this.length && this.timestamps[this.head] < now - DAY_MS) {
      this.head = (this.head + 1) % this.capacity;
      this.length--;
    }
    const timestamps = new Array<number>(this.length);
    const values = new Array<number | null>(this.length);
    for (let i = 0; i < this.length; i++) {
      const index = (this.head + i) % this.capacity;
      timestamps[i] = this.timestamps[index];
      values[i] = this.values[index];
    }
    return [timestamps, values];
  }
}

function sample(timestamp: number): CpuSample {
  const t = timestamp / 1000;
  return {timestamp, value: Math.round((38 + 18 * Math.sin(t / 4800) + 9 * Math.sin(t / 120) + 5 * Math.sin(t * 1.7)) * 10) / 10};
}

export const demoCpuSource: CpuSource = {
  subscribe(onSamples) {
    const now = Date.now();
    // 43,201 initial samples; the live stream grows to ~86,400 per day.
    onSamples(Array.from({length: 43_201}, (_, i) => sample(now - DAY_MS + i * 2000)));
    const timer = window.setInterval(() => onSamples([sample(Date.now())]), 1000);
    return () => window.clearInterval(timer);
  },
};
