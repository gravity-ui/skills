export const DAY_MS = 24 * 60 * 60 * 1000;

export interface CpuSample {
  /** Unix timestamp in milliseconds. */
  timestamp: number;
  /** CPU utilization, 0–100; null represents a missing measurement. */
  value: number | null;
}

export interface CpuDataSource {
  /** History and live batches must be ordered by timestamp. */
  getHistory: () => readonly CpuSample[];
  /** Returns an unsubscribe function that releases the connection/timer. */
  subscribe: (receive: (samples: readonly CpuSample[]) => void) => () => void;
}

/** Sliding window with amortized compaction, avoiding shift() for every sample. */
export class CpuWindow {
  private samples: CpuSample[] = [];
  private head = 0;

  append(batch: readonly CpuSample[], now: number) {
    this.prune(now);
    for (const sample of batch) {
      const {timestamp, value} = sample;
      if (!Number.isFinite(timestamp) || timestamp < now - DAY_MS || timestamp > now ||
        (value !== null && (!Number.isFinite(value) || value < 0 || value > 100))) continue;
      const last = this.samples.at(-1);
      // Ignore late data; replace a repeated timestamp without duplicating it.
      if (last && timestamp < last.timestamp) continue;
      if (last && timestamp === last.timestamp) this.samples[this.samples.length - 1] = {...sample};
      else this.samples.push({...sample});
    }
  }

  prune(now: number) {
    while (this.head < this.samples.length && this.samples[this.head].timestamp < now - DAY_MS) {
      this.head++;
    }
    if (this.head > 0 && this.head >= this.samples.length / 2) {
      this.samples = this.samples.slice(this.head);
      this.head = 0;
    }
  }

  snapshot(now: number) {
    this.prune(now);
    const size = this.samples.length - this.head;
    const timeline = new Array<number>(size);
    const values = new Array<number | null>(size);
    for (let i = 0; i < size; i++) {
      const sample = this.samples[this.head + i];
      timeline[i] = sample.timestamp;
      values[i] = sample.value;
    }
    return {timeline, values, count: size, latest: this.samples.at(-1) ?? null};
  }
}

function demoValue(timestamp: number) {
  const t = timestamp / 1000;
  const baseline = 34 + 13 * Math.sin(t / 3200) + 6 * Math.sin(t / 540);
  const burst = 35 * Math.exp(-(((t % 14400 - 8400) / 700) ** 2));
  return Math.round(Math.min(100, Math.max(0, baseline + burst + 2 * Math.sin(t / 3))) * 10) / 10;
}

/** Explicit demo adapter; replace with a real metric service in production. */
export const demoCpuSource: CpuDataSource = {
  getHistory() {
    const now = Date.now();
    return Array.from({length: DAY_MS / 2000 + 1}, (_, i) => {
      const timestamp = now - DAY_MS + i * 2000;
      return {timestamp, value: demoValue(timestamp)};
    });
  },
  subscribe(receive) {
    const timer = window.setInterval(() => {
      const timestamp = Date.now();
      receive([{timestamp, value: demoValue(timestamp)}]);
    }, 2000);
    return () => window.clearInterval(timer);
  },
};
