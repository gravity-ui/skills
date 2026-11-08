export const DAY_MS = 86_400_000;
export const MAX_POINTS = 100_000;

export interface CpuSample {
  /** Unix timestamp in milliseconds; samples arrive chronologically. */
  timestamp: number;
  /** Utilization in percent; null indicates missing data. */
  value: number | null;
}

export interface CpuSource {
  getHistory(): readonly CpuSample[];
  /** Return a cleanup function that closes the streaming subscription. */
  subscribe(listener: (samples: readonly CpuSample[]) => void): () => void;
}

/** Bounded ring buffer: inserts never shift the whole history. */
export class CpuBuffer {
  private samples: (CpuSample | undefined)[];
  private start = 0;
  private length = 0;

  constructor(private capacity = MAX_POINTS) {
    if (!Number.isInteger(capacity) || capacity < 1)
      throw new Error("Invalid capacity");
    this.samples = new Array(capacity);
  }

  append(batch: readonly CpuSample[]) {
    for (const sample of batch) {
      if (
        !Number.isFinite(sample.timestamp) ||
        (sample.value !== null &&
          (!Number.isFinite(sample.value) ||
            sample.value < 0 ||
            sample.value > 100))
      )
        continue;
      const last = this.samples[(this.start + this.length - 1) % this.capacity];
      if (last && sample.timestamp < last.timestamp) continue;
      if (last && sample.timestamp === last.timestamp) {
        this.samples[(this.start + this.length - 1) % this.capacity] = {
          ...sample,
        };
        continue;
      }
      if (this.length === this.capacity) {
        this.samples[this.start] = undefined;
        this.start = (this.start + 1) % this.capacity;
        this.length--;
      }
      this.samples[(this.start + this.length) % this.capacity] = { ...sample };
      this.length++;
    }
  }

  snapshot(now: number) {
    while (this.length && this.samples[this.start]!.timestamp < now - DAY_MS) {
      this.samples[this.start] = undefined;
      this.start = (this.start + 1) % this.capacity;
      this.length--;
    }
    const timeline: number[] = new Array(this.length);
    const values: (number | null)[] = new Array(this.length);
    let sum = 0,
      valid = 0,
      maximum: number | null = null;
    for (let i = 0; i < this.length; i++) {
      const sample = this.samples[(this.start + i) % this.capacity]!;
      timeline[i] = sample.timestamp;
      values[i] = sample.value;
      if (sample.value !== null) {
        sum += sample.value;
        valid++;
        maximum = Math.max(maximum ?? 0, sample.value);
      }
    }
    return {
      timeline,
      values,
      count: this.length,
      current: values.at(-1) ?? null,
      average: valid ? sum / valid : null,
      maximum,
      lastTimestamp: timeline.at(-1),
    };
  }
}

/** Demo adapter. Replace with API history and a streaming subscription. */
export function createDemoCpuSource(): CpuSource {
  const interval = 2_000;
  const utilization = (timestamp: number) => {
    const t = timestamp / 1000;
    const wave = 34 + 13 * Math.sin(t / 7200) + 6 * Math.sin(t / 1250);
    const noise = 3 * Math.sin(t * 1.73) + 2 * Math.cos(t * 0.37);
    const peak = 37 * Math.pow(Math.max(0, Math.sin(t / 3100)), 20);
    return Math.round(Math.max(2, Math.min(98, wave + noise + peak)) * 10) / 10;
  };
  return {
    getHistory() {
      const now = Math.floor(Date.now() / interval) * interval;
      return Array.from({ length: DAY_MS / interval + 1 }, (_, i) => {
        const timestamp = now - DAY_MS + i * interval;
        return { timestamp, value: utilization(timestamp) };
      });
    },
    subscribe(listener) {
      const timer = window.setInterval(() => {
        const timestamp = Math.floor(Date.now() / interval) * interval;
        listener([{ timestamp, value: utilization(timestamp) }]);
      }, interval);
      return () => window.clearInterval(timer);
    },
  };
}
