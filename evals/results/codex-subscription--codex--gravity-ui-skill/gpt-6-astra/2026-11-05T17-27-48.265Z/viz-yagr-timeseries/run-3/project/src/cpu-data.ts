export const DAY_MS = 24 * 60 * 60 * 1_000;
export const MAX_POINTS = 100_000;

export interface CpuSample {
  /** Unix timestamp in milliseconds. */
  timestamp: number;
  /** CPU utilization in percent; null represents missing data. */
  value: number | null;
}

export interface CpuDataSource {
  /** Emit history first, then ordered live batches. The returned function closes the subscription. */
  subscribe(onData: (samples: readonly CpuSample[]) => void, onError: (error: Error) => void): () => void;
}

/** Bounded ring: no shifting a large array on every incoming sample. */
export class CpuBuffer {
  private timestamps: Float64Array;
  private values: (number | null)[];
  private start = 0;
  private count = 0;

  constructor(private capacity = MAX_POINTS) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.timestamps = new Float64Array(capacity);
    this.values = new Array(capacity);
  }

  append(samples: readonly CpuSample[], now: number) {
    this.expire(now);
    for (const {timestamp, value} of samples) {
      if (!Number.isFinite(timestamp) || timestamp < now - DAY_MS || timestamp > now) continue;
      if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) continue;
      const last = (this.start + this.count - 1) % this.capacity;
      if (this.count && timestamp < this.timestamps[last]) continue;
      if (this.count && timestamp === this.timestamps[last]) {
        this.values[last] = value;
        continue;
      }
      const index = (this.start + this.count) % this.capacity;
      this.timestamps[index] = timestamp;
      this.values[index] = value;
      if (this.count === this.capacity) this.start = (this.start + 1) % this.capacity;
      else this.count++;
    }
  }

  expire(now: number) {
    while (this.count && this.timestamps[this.start] < now - DAY_MS) {
      this.start = (this.start + 1) % this.capacity;
      this.count--;
    }
  }

  snapshot() {
    const timeline = new Array<number>(this.count);
    const values = new Array<number | null>(this.count);
    for (let i = 0; i < this.count; i++) {
      const index = (this.start + i) % this.capacity;
      timeline[i] = this.timestamps[index];
      values[i] = this.values[index];
    }
    return {timeline, values};
  }
}

function demoValue(timestamp: number) {
  const t = timestamp / 1_000;
  const baseline = 30 + 10 * Math.sin(t / 3_200) + 5 * Math.sin(t / 330);
  const peak = 36 * Math.max(0, Math.sin(t / 1_700)) ** 18;
  return Math.round((baseline + peak + 2 * Math.sin(t / 7)) * 10) / 10;
}

/** Replace this source with the monitoring API/WebSocket adapter when available. */
export const demoCpuSource: CpuDataSource = {
  subscribe(onData) {
    const now = Date.now();
    const history: CpuSample[] = [];
    for (let timestamp = now - DAY_MS; timestamp <= now; timestamp += 2_000) {
      history.push({timestamp, value: demoValue(timestamp)});
    }
    onData(history);
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      onData([{timestamp, value: demoValue(timestamp)}]);
    }, 2_000);
    return () => window.clearInterval(timer);
  },
};
