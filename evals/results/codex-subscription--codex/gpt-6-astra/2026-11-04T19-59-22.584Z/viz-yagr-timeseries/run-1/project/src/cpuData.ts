export const DAY_MS = 24 * 60 * 60 * 1000;
export const SAMPLE_MS = 2000;

export interface CpuSnapshot {
  /** Unix timestamps in milliseconds, ascending; values are percentages. */
  timeline: number[];
  values: number[];
}

export interface CpuSource {
  getSnapshot(): CpuSnapshot;
  /** Notify after new samples arrive; return a function that releases the subscription. */
  subscribe(notify: () => void): () => void;
}

/** A bounded ring avoids shifting tens of thousands of values on every sample. */
export class CpuBuffer {
  private readonly times: Float64Array;
  private readonly values: Float64Array;
  private start = 0;
  private length = 0;

  constructor(private readonly capacity = DAY_MS / SAMPLE_MS + 1) {
    if (!Number.isInteger(capacity) || capacity < 1) throw new Error('Invalid capacity');
    this.times = new Float64Array(capacity);
    this.values = new Float64Array(capacity);
  }

  append(time: number, value: number) {
    if (!Number.isFinite(time) || !Number.isFinite(value) || value < 0 || value > 100) return;
    const last = (this.start + this.length - 1) % this.capacity;
    if (this.length && time <= this.times[last]) return;
    while (this.length && this.times[this.start] < time - DAY_MS) {
      this.start = (this.start + 1) % this.capacity;
      this.length--;
    }
    const index = (this.start + this.length) % this.capacity;
    this.times[index] = time;
    this.values[index] = value;
    if (this.length === this.capacity) this.start = (this.start + 1) % this.capacity;
    else this.length++;
  }

  snapshot(): CpuSnapshot {
    const timeline = new Array<number>(this.length);
    const values = new Array<number>(this.length);
    for (let i = 0; i < this.length; i++) {
      const index = (this.start + i) % this.capacity;
      timeline[i] = this.times[index];
      values[i] = this.values[index];
    }
    return {timeline, values};
  }
}

function demoValue(time: number) {
  const t = time / 1000;
  const baseline = 33 + 12 * Math.sin(t / 3800) + 7 * Math.sin(t / 720);
  const peak = 32 * Math.pow(Math.max(0, Math.sin(t / 2100)), 16);
  return Math.min(100, Math.max(0, baseline + peak + 3 * Math.sin(t / 11)));
}

/** Demo only. Replace this source with an adapter for the monitoring API. */
export function createDemoCpuSource(): CpuSource {
  const buffer = new CpuBuffer();
  const end = Math.floor(Date.now() / SAMPLE_MS) * SAMPLE_MS;
  for (let time = end - DAY_MS; time <= end; time += SAMPLE_MS) {
    buffer.append(time, demoValue(time));
  }
  const listeners = new Set<() => void>();
  let timer: ReturnType<typeof setInterval> | undefined;
  return {
    getSnapshot: () => buffer.snapshot(),
    subscribe(notify) {
      listeners.add(notify);
      if (timer === undefined) {
        timer = setInterval(() => {
          const now = Math.floor(Date.now() / SAMPLE_MS) * SAMPLE_MS;
          buffer.append(now, demoValue(now));
          listeners.forEach((listener) => listener());
        }, SAMPLE_MS);
      }
      return () => {
        listeners.delete(notify);
        if (!listeners.size) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
  };
}
