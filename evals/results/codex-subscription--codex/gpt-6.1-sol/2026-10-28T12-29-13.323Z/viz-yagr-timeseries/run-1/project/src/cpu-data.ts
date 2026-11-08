export const DAY = 24 * 60 * 60 * 1000;
export const SAMPLE_INTERVAL = 2_000;

/** UTC epoch milliseconds, strictly increasing, and corresponding CPU percentages. */
export interface CpuHistory {
  timestamps: number[];
  values: number[];
}

export const hosts = [
  {
    id: "app-server-01",
    ip: "10.128.0.12",
    region: "ru-central1-a",
    cores: 8,
    memory: "16 ГБ",
    offset: 0,
  },
  {
    id: "app-server-02",
    ip: "10.128.0.13",
    region: "ru-central1-b",
    cores: 8,
    memory: "16 ГБ",
    offset: 7,
  },
  {
    id: "worker-01",
    ip: "10.128.0.21",
    region: "ru-central1-a",
    cores: 16,
    memory: "32 ГБ",
    offset: -9,
  },
];

// Deterministic demo source. Replace with an API snapshot and stream in production.
export function demoCpuValue(timestamp: number, offset = 0): number {
  const hours = timestamp / 3_600_000;
  const phase = ((hours % 24) + 24) % 24;
  const pulse = (center: number, width: number, height: number) =>
    height * Math.exp(-Math.pow((phase - center) / width, 2));
  const value =
    28 +
    offset +
    8 * Math.sin(hours * 0.8) +
    3 * Math.sin(hours * 8) +
    1.5 * Math.sin(hours * 83) +
    0.7 * Math.sin(hours * 419) +
    pulse(10.2, 1.9, 22) +
    pulse(15.1, 0.16, 48) +
    pulse(19.3, 0.65, 15);
  return Math.round(Math.max(0, Math.min(100, value)) * 10) / 10;
}

export function createDemoHistory(now = Date.now(), offset = 0): CpuHistory {
  const end = Math.floor(now / SAMPLE_INTERVAL) * SAMPLE_INTERVAL;
  const timestamps: number[] = [];
  const values: number[] = [];
  for (let time = end - DAY; time <= end; time += SAMPLE_INTERVAL) {
    timestamps.push(time);
    values.push(demoCpuValue(time, offset));
  }
  return { timestamps, values };
}

export function lowerBound(values: number[], target: number): number {
  let low = 0;
  let high = values.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (values[mid] < target) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Ignore duplicate/out-of-order samples and bound memory to the last day. */
export function appendCpuSample(
  history: CpuHistory,
  timestamp: number,
  value: number,
): CpuHistory {
  if (
    !Number.isFinite(timestamp) ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 100 ||
    timestamp <= (history.timestamps.at(-1) ?? -Infinity)
  )
    return history;
  const start = lowerBound(history.timestamps, timestamp - DAY);
  return {
    timestamps: [...history.timestamps.slice(start), timestamp],
    values: [...history.values.slice(start), value],
  };
}

export function getCpuStats(history: CpuHistory, hours: number) {
  const end = history.timestamps.at(-1);
  if (end === undefined)
    return { current: null, average: null, peak: null, count: 0 };
  const start = lowerBound(history.timestamps, end - hours * 3_600_000);
  let sum = 0;
  let peak = 0;
  for (let i = start; i < history.values.length; i++) {
    sum += history.values[i];
    peak = Math.max(peak, history.values[i]);
  }
  return {
    current: history.values.at(-1)!,
    average: sum / (history.values.length - start),
    peak,
    count: history.values.length - start,
  };
}
