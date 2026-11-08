export const DAY_MS = 24 * 60 * 60 * 1000;
export interface CpuSample { timestamp: number; value: number | null }

/** Timestamps are Unix milliseconds; batches must be ordered oldest first.
 * subscribe must return a function that closes the stream and removes listeners.
 */
export interface CpuSource {
  getHistory(): readonly CpuSample[];
  subscribe(listener: (samples: readonly CpuSample[]) => void): () => void;
}

/** Bounded storage: no shifting or copying the entire history on each sample. */
export class CpuBuffer {
  private times: Float64Array;
  private values: Float64Array;
  private start = 0;
  private length = 0;

  constructor(private capacity = 100_000) {
    this.times = new Float64Array(capacity);
    this.values = new Float64Array(capacity);
  }

  append(samples: readonly CpuSample[], now = Date.now()) {
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || timestamp <= now - DAY_MS || timestamp > now ||
          (value !== null && (!Number.isFinite(value) || value < 0 || value > 100))) continue;
      const last = (this.start + this.length - 1) % this.capacity;
      if (this.length && timestamp < this.times[last]) continue;
      if (this.length && timestamp === this.times[last]) {
        this.values[last] = value ?? NaN;
        continue;
      }
      const index = (this.start + this.length) % this.capacity;
      this.times[index] = timestamp;
      this.values[index] = value ?? NaN;
      if (this.length === this.capacity) this.start = (this.start + 1) % this.capacity;
      else this.length++;
    }
    this.prune(now);
  }

  prune(now: number) {
    while (this.length && this.times[this.start] <= now - DAY_MS) {
      this.start = (this.start + 1) % this.capacity;
      this.length--;
    }
  }

  snapshot() {
    const timeline = new Array<number>(this.length);
    const values = new Array<number | null>(this.length);
    let sum = 0, count = 0, peak = 0;
    for (let i = 0; i < this.length; i++) {
      const index = (this.start + i) % this.capacity;
      const value = this.values[index];
      timeline[i] = this.times[index];
      values[i] = Number.isNaN(value) ? null : value;
      if (!Number.isNaN(value)) { sum += value; count++; peak = Math.max(peak, value); }
    }
    return {timeline, values, current: values.at(-1) ?? null,
      average: count ? sum / count : null, peak: count ? peak : null};
  }
}

function demoValue(timestamp: number) {
  const t = timestamp / 1000;
  const wave = 35 + 12 * Math.sin(t / 3200) + 7 * Math.sin(t / 780);
  const burst = 27 * Math.max(0, Math.sin(t / 113)) ** 16;
  return Math.min(100, Math.max(0, wave + burst + 2 * Math.sin(t * 1.7)));
}

/** Local demo only. Replace with an application-specific history/stream adapter. */
export const demoCpuSource: CpuSource = {
  getHistory() {
    const now = Date.now();
    return Array.from({length: 43_200}, (_, i) => {
      const timestamp = now - DAY_MS + (i + 1) * 2000;
      return {timestamp, value: demoValue(timestamp)};
    });
  },
  subscribe(listener) {
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      listener([{timestamp, value: demoValue(timestamp)}]);
    }, 2000);
    return () => window.clearInterval(timer);
  },
};
