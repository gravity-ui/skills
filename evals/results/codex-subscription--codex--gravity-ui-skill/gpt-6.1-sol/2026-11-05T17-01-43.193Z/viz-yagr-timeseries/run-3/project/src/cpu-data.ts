export const DAY_MS = 24 * 60 * 60 * 1_000;
export const SAMPLE_INTERVAL = 2_000;

export interface CpuSample {
  timestamp: number;
  value: number;
}

/** Timestamps are Unix milliseconds; values are percentages, ordered oldest first. */
export interface CpuDataSource {
  loadHistory(signal: AbortSignal): Promise<CpuSample[]>;
  subscribe(onSamples: (samples: CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

export interface CpuSnapshot {
  timeline: number[];
  values: number[];
  current: number;
  average: number;
  maximum: number;
  p95: number;
}

/** A bounded ring avoids shifting thousands of samples for every incoming point. */
export class CpuBuffer {
  private readonly timestamps: Float64Array;
  private readonly values: Float64Array;
  private head = 0;
  private length = 0;

  constructor(private readonly capacity = 100_000) {
    this.timestamps = new Float64Array(capacity);
    this.values = new Float64Array(capacity);
  }

  append(samples: CpuSample[]) {
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || !Number.isFinite(value) || value < 0 || value > 100) continue;
      const last = (this.head + this.length - 1) % this.capacity;
      if (this.length && timestamp < this.timestamps[last]) continue;
      if (this.length && timestamp === this.timestamps[last]) {
        this.values[last] = value;
        continue;
      }
      while (this.length && this.timestamps[this.head] < timestamp - DAY_MS) {
        this.head = (this.head + 1) % this.capacity;
        this.length--;
      }
      const index = (this.head + this.length) % this.capacity;
      this.timestamps[index] = timestamp;
      this.values[index] = value;
      if (this.length < this.capacity) this.length++;
      else this.head = (this.head + 1) % this.capacity;
    }
  }

  snapshot(): CpuSnapshot {
    const timeline: number[] = [];
    const values: number[] = [];
    // A histogram computes P95 without sorting a copy of the entire time series.
    const histogram = new Uint32Array(1001);
    let sum = 0;
    let maximum = 0;
    for (let i = 0; i < this.length; i++) {
      const index = (this.head + i) % this.capacity;
      const value = this.values[index];
      timeline.push(this.timestamps[index]);
      values.push(value);
      sum += value;
      maximum = Math.max(maximum, value);
      histogram[Math.round(value * 10)]++;
    }
    let count = 0;
    let p95 = 0;
    for (let i = 0; i < histogram.length; i++) {
      count += histogram[i];
      if (count >= Math.ceil(this.length * 0.95)) { p95 = i / 10; break; }
    }
    return {timeline, values, current: values.at(-1) ?? 0, average: this.length ? sum / this.length : 0, maximum, p95};
  }
}

function demoValue(timestamp: number) {
  const t = timestamp / 1_000;
  const cycle = ((t % 86_400) + 86_400) % 86_400;
  const pulse = (center: number, width: number, height: number) => height * Math.exp(-(((cycle - center) / width) ** 2));
  const value = 29 + 8 * Math.sin(t / 5_800) + 5 * Math.sin(t / 1_170)
    + 2.3 * Math.sin(t / 36) + 1.2 * Math.sin(t / 7)
    + pulse(17_000, 900, 27) + pulse(39_000, 1_700, 38) + pulse(64_000, 1_100, 29);
  return Math.round(Math.max(2, Math.min(99, value)) * 10) / 10;
}

/** Replace this adapter with the monitoring API / WebSocket; no backend is configured in this project. */
export const demoCpuSource: CpuDataSource = {
  async loadHistory(signal) {
    signal.throwIfAborted();
    const end = Math.floor(Date.now() / SAMPLE_INTERVAL) * SAMPLE_INTERVAL;
    return Array.from({length: DAY_MS / SAMPLE_INTERVAL + 1}, (_, i) => {
      const timestamp = end - DAY_MS + i * SAMPLE_INTERVAL;
      return {timestamp, value: demoValue(timestamp)};
    });
  },
  subscribe(onSamples) {
    let last = Math.floor(Date.now() / SAMPLE_INTERVAL) * SAMPLE_INTERVAL;
    const timer = window.setInterval(() => {
      const end = Math.floor(Date.now() / SAMPLE_INTERVAL) * SAMPLE_INTERVAL;
      const samples: CpuSample[] = [];
      // Recover the current window after background-tab timer throttling.
      for (let timestamp = Math.max(last + SAMPLE_INTERVAL, end - DAY_MS); timestamp <= end; timestamp += SAMPLE_INTERVAL) {
        samples.push({timestamp, value: demoValue(timestamp)});
      }
      last = end;
      if (samples.length) onSamples(samples);
    }, SAMPLE_INTERVAL);
    return () => window.clearInterval(timer);
  },
};
