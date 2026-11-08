export const DAY_MS = 24 * 60 * 60 * 1000;
export const SAMPLE_MS = 2000;
const CAPACITY = DAY_MS / SAMPLE_MS + 1;

export interface CpuSnapshot {
  timeline: number[];
  values: number[];
  current: number;
  average: number;
  maximum: number;
  p95: number;
  updatedAt: number;
}

export interface CpuSource {
  getSnapshot(): CpuSnapshot;
  subscribe(listener: () => void): () => void;
}

/** Fixed-size ring: appending never shifts the entire day's history. */
export class CpuHistory {
  private times = new Float64Array(CAPACITY);
  private values = new Float64Array(CAPACITY);
  private head = 0;
  private size = 0;

  append(timestamp: number, value: number) {
    if (!Number.isFinite(timestamp) || !Number.isFinite(value)) return;
    const last = (this.head + this.size - 1) % CAPACITY;
    if (this.size && timestamp <= this.times[last]) return;
    while (this.size && this.times[this.head] < timestamp - DAY_MS) {
      this.head = (this.head + 1) % CAPACITY;
      this.size--;
    }
    const index = (this.head + this.size) % CAPACITY;
    this.times[index] = timestamp;
    this.values[index] = Math.max(0, Math.min(100, value));
    if (this.size === CAPACITY) this.head = (this.head + 1) % CAPACITY;
    else this.size++;
  }

  snapshot(): CpuSnapshot {
    const timeline = new Array<number>(this.size);
    const values = new Array<number>(this.size);
    const histogram = new Uint32Array(1001);
    let sum = 0;
    let maximum = 0;
    for (let i = 0; i < this.size; i++) {
      const index = (this.head + i) % CAPACITY;
      timeline[i] = this.times[index];
      values[i] = this.values[index];
      sum += values[i];
      maximum = Math.max(maximum, values[i]);
      histogram[Math.round(values[i] * 10)]++;
    }
    let count = 0;
    let p95 = 0;
    for (let i = 0; i < histogram.length; i++) {
      count += histogram[i];
      if (count >= Math.ceil(this.size * 0.95)) {
        p95 = i / 10;
        break;
      }
    }
    return {
      timeline,
      values,
      current: values.at(-1) ?? 0,
      average: this.size ? sum / this.size : 0,
      maximum,
      p95,
      updatedAt: timeline.at(-1) ?? 0,
    };
  }
}

function demoValue(time: number) {
  const hour = time / 3_600_000;
  const wave = 35 + 10 * Math.sin(hour * 0.8) + 6 * Math.sin(hour * 2.3);
  const peaks = 32 * Math.pow(Math.max(0, Math.sin(hour * 1.7)), 18);
  const detail = 2.2 * Math.sin(time / 7300) + 1.2 * Math.sin(time / 1300);
  return Math.round(Math.min(96, Math.max(5, wave + peaks + detail)) * 10) / 10;
}

/** Demo adapter; replace this source with a WebSocket/SSE adapter for production. */
export function createDemoSource(): CpuSource {
  const history = new CpuHistory();
  const now = Math.floor(Date.now() / SAMPLE_MS) * SAMPLE_MS;
  for (let time = now - DAY_MS; time <= now; time += SAMPLE_MS) {
    history.append(time, demoValue(time));
  }
  let snapshot = history.snapshot();
  let timer: ReturnType<typeof setInterval> | undefined;
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      if (timer === undefined) {
        timer = setInterval(() => {
          const end = Math.floor(Date.now() / SAMPLE_MS) * SAMPLE_MS;
          const start = Math.max(snapshot.updatedAt + SAMPLE_MS, end - DAY_MS);
          if (start > end) return;
          for (let time = start; time <= end; time += SAMPLE_MS) {
            history.append(time, demoValue(time));
          }
          snapshot = history.snapshot();
          listeners.forEach((notify) => notify());
        }, SAMPLE_MS);
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size && timer !== undefined) {
          clearInterval(timer);
          timer = undefined;
        }
      };
    },
  };
}
