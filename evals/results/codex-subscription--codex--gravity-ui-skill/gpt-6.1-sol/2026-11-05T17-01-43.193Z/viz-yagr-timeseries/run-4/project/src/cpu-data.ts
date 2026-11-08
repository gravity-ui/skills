export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_POINTS = 100_000;

export interface CpuSample {
  /** Unix timestamp in milliseconds; samples must be ordered oldest first. */
  timestamp: number;
  /** CPU utilization in percent; null represents a gap. */
  value: number | null;
}

export interface CpuDataSource {
  loadHistory(signal: AbortSignal): Promise<readonly CpuSample[]>;
  /** Return a function that closes the connection and removes its listeners. */
  subscribe(onSamples: (samples: readonly CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

/** Bounded ring: constant-time ingestion, with allocation only when rendering. */
export class CpuWindow {
  private times: Float64Array;
  private values: (number | null)[];
  private head = 0;
  private length = 0;

  constructor(private capacity = MAX_POINTS) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.times = new Float64Array(capacity);
    this.values = new Array(capacity);
  }

  append(samples: readonly CpuSample[]) {
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) ||
        (value !== null && (!Number.isFinite(value) || value < 0 || value > 100))) continue;
      if (this.length) {
        const last = (this.head + this.length - 1) % this.capacity;
        if (timestamp < this.times[last]) continue;
        if (timestamp === this.times[last]) {
          this.values[last] = value;
          continue;
        }
      }
      const index = (this.head + this.length) % this.capacity;
      this.times[index] = timestamp;
      this.values[index] = value;
      if (this.length === this.capacity) this.head = (this.head + 1) % this.capacity;
      else this.length++;
    }
  }

  snapshot(now: number) {
    const cutoff = now - DAY_MS;
    while (this.length && this.times[this.head] < cutoff) {
      this.head = (this.head + 1) % this.capacity;
      this.length--;
    }
    const timeline = new Array<number>(this.length);
    const values = new Array<number | null>(this.length);
    let sum = 0, count = 0, max = 0;
    for (let i = 0; i < this.length; i++) {
      const index = (this.head + i) % this.capacity;
      timeline[i] = this.times[index];
      const value = this.values[index];
      values[i] = value;
      if (value !== null) {
        sum += value;
        count++;
        max = Math.max(max, value);
      }
    }
    return {
      timeline, values,
      stats: {
        current: values.at(-1) ?? null,
        average: count ? sum / count : null,
        max: count ? max : null,
        points: this.length,
        updatedAt: timeline.at(-1) ?? null,
      },
    };
  }
}

export type CpuStats = ReturnType<CpuWindow['snapshot']>['stats'];

function demoValue(timestamp: number) {
  const t = timestamp / 1000;
  const wave = Math.sin(t / 2700) * 10 + Math.sin(t / 310) * 5;
  const burst = Math.max(0, Math.sin(t / 1100)) ** 16 * 32;
  const noise = Math.sin(t * 1.7) * Math.cos(t * 0.41) * 4;
  return Math.round(Math.min(100, Math.max(0, 31 + wave + burst + noise)) * 10) / 10;
}

/** Demo only: replace this adapter with your HTTP history + WebSocket stream. */
export function createDemoCpuSource(): CpuDataSource {
  return {
    async loadHistory(signal) {
      signal.throwIfAborted();
      const end = Math.floor(Date.now() / 2000) * 2000;
      return Array.from({length: DAY_MS / 2000 + 1}, (_, index) => {
        const timestamp = end - DAY_MS + index * 2000;
        return {timestamp, value: demoValue(timestamp)};
      });
    },
    subscribe(onSamples) {
      const timer = window.setInterval(() => {
        const timestamp = Math.floor(Date.now() / 2000) * 2000;
        onSamples([{timestamp, value: demoValue(timestamp)}]);
      }, 2000);
      return () => window.clearInterval(timer);
    },
  };
}
