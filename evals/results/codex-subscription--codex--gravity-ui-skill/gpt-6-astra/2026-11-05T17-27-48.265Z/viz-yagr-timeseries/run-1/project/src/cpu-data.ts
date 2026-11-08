export const DAY_MS = 24 * 60 * 60 * 1000;

export interface CpuSample {
  /** Unix time in milliseconds. Samples arrive in chronological order. */
  timestamp: number;
  value: number | null;
}

export interface CpuSource {
  /** Emit history first, then live batches; return a function that closes the subscription. */
  subscribe(onSamples: (samples: readonly CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

/** Bounded ring buffer: O(1) ingestion, no shifting large arrays on every sample. */
export class CpuBuffer {
  private readonly times: Float64Array;
  private readonly values: (number | null)[];
  private start = 0;
  private length = 0;

  constructor(private readonly capacity = 100_000) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.times = new Float64Array(capacity);
    this.values = new Array(capacity);
  }

  append(samples: readonly CpuSample[], now: number) {
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || timestamp < now - DAY_MS || timestamp > now ||
          (value !== null && (!Number.isFinite(value) || value < 0 || value > 100))) continue;
      const last = (this.start + this.length - 1) % this.capacity;
      if (this.length && timestamp < this.times[last]) continue;
      if (this.length && timestamp === this.times[last]) {
        this.values[last] = value;
        continue;
      }
      const index = (this.start + this.length) % this.capacity;
      this.times[index] = timestamp;
      this.values[index] = value;
      if (this.length === this.capacity) this.start = (this.start + 1) % this.capacity;
      else this.length++;
    }
    this.prune(now);
  }

  prune(now: number) {
    const previousLength = this.length;
    while (this.length && this.times[this.start] < now - DAY_MS) {
      this.start = (this.start + 1) % this.capacity;
      this.length--;
    }
    return previousLength !== this.length;
  }

  snapshot() {
    const timeline = new Array<number>(this.length);
    const data = new Array<number | null>(this.length);
    for (let i = 0; i < this.length; i++) {
      const index = (this.start + i) % this.capacity;
      timeline[i] = this.times[index];
      data[i] = this.values[index];
    }
    return {timeline, data};
  }
}

function demoValue(timestamp: number) {
  return Math.round((38 + 17 * Math.sin(timestamp / 3_000_000) +
    8 * Math.sin(timestamp / 320_000) + 4 * Math.sin(timestamp / 7_000)) * 10) / 10;
}

/** Demo only: replace this source with the monitoring API's history + stream adapter. */
export const demoCpuSource: CpuSource = {
  subscribe(onSamples) {
    const now = Date.now();
    const history: CpuSample[] = [];
    for (let timestamp = now - DAY_MS; timestamp <= now; timestamp += 2000) {
      history.push({timestamp, value: demoValue(timestamp)});
    }
    onSamples(history);
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      onSamples([{timestamp, value: demoValue(timestamp)}]);
    }, 2000);
    return () => window.clearInterval(timer);
  },
};
