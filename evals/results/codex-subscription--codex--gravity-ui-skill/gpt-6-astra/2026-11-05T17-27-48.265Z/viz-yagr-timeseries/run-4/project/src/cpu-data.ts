export const DAY_MS = 24 * 60 * 60 * 1000;
export const MAX_POINTS = 100_000;

/** Timestamps are Unix milliseconds; samples must arrive in chronological order. */
export interface CpuSample {
  timestamp: number;
  value: number | null;
}

export interface CpuSource {
  loadHistory(signal: AbortSignal): Promise<readonly CpuSample[]>;
  /** Returns a function that closes the connection and removes its listeners. */
  subscribe(onSamples: (samples: readonly CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

/** Bounded ring buffer: O(1) append, no shifting a day's history per sample. */
export class CpuBuffer {
  private times: Float64Array;
  private values: (number | null)[];
  private start = 0;
  size = 0;

  constructor(private capacity = MAX_POINTS) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.times = new Float64Array(capacity);
    this.values = new Array(capacity);
  }

  append(samples: readonly CpuSample[], now = Date.now()) {
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || timestamp < now - DAY_MS || timestamp > now) continue;
      if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) continue;
      const last = (this.start + this.size - 1) % this.capacity;
      if (this.size && timestamp < this.times[last]) continue;
      if (this.size && timestamp === this.times[last]) {
        this.values[last] = value;
        continue;
      }
      const index = (this.start + this.size) % this.capacity;
      this.times[index] = timestamp;
      this.values[index] = value;
      if (this.size === this.capacity) this.start = (this.start + 1) % this.capacity;
      else this.size++;
    }
    this.prune(now);
  }

  prune(now: number) {
    const before = this.size;
    while (this.size && this.times[this.start] < now - DAY_MS) {
      this.values[this.start] = null;
      this.start = (this.start + 1) % this.capacity;
      this.size--;
    }
    return this.size !== before;
  }

  snapshot() {
    const timeline = new Array<number>(this.size);
    const values = new Array<number | null>(this.size);
    let sum = 0, count = 0, peak: number | null = null;
    for (let i = 0; i < this.size; i++) {
      const index = (this.start + i) % this.capacity;
      timeline[i] = this.times[index];
      const value = this.values[index];
      values[i] = value;
      if (value !== null) {
        sum += value;
        count++;
        peak = Math.max(peak ?? 0, value);
      }
    }
    return {
      timeline, values, count: this.size,
      current: values.at(-1) ?? null,
      average: count ? sum / count : null,
      peak,
      lastTimestamp: timeline.at(-1),
    };
  }
}

export type CpuSnapshot = ReturnType<CpuBuffer['snapshot']>;

function demoValue(timestamp: number) {
  const t = timestamp / 1000;
  const wave = 34 + 12 * Math.sin(t / 2800) + 6 * Math.sin(t / 330);
  const spike = 29 * Math.max(0, Math.sin(t / 910)) ** 18;
  return Math.round(Math.min(100, Math.max(0, wave + spike + 2 * Math.sin(t * 1.7))) * 10) / 10;
}

/** Explicit demo adapter. Replace with a history API + SSE/WebSocket adapter. */
export const demoCpuSource: CpuSource = {
  async loadHistory(signal) {
    signal.throwIfAborted();
    const end = Math.floor(Date.now() / 2000) * 2000;
    const points = Array.from({length: DAY_MS / 2000 + 1}, (_, i) => {
      const timestamp = end - DAY_MS + i * 2000;
      return {timestamp, value: demoValue(timestamp)};
    });
    signal.throwIfAborted();
    return points;
  },
  subscribe(onSamples) {
    const timer = window.setInterval(() => {
      const timestamp = Math.floor(Date.now() / 2000) * 2000;
      onSamples([{timestamp, value: demoValue(timestamp)}]);
    }, 2000);
    return () => window.clearInterval(timer);
  },
};
