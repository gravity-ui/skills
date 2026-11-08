export const DAY = 24 * 60 * 60 * 1000;
export const SAMPLE_INTERVAL = 2000;

/** Aligned, ascending Unix timestamps in milliseconds and CPU percentages. */
export interface CpuData {
  timeline: number[];
  values: (number | null)[];
}

export function demoCpuValue(timestamp: number): number {
  const t = timestamp / 1000;
  const baseline = 32 + 13 * Math.sin(t / 4100) + 6 * Math.sin(t / 370);
  const burst = 32 * Math.pow(Math.max(0, Math.sin(t / 1250)), 18);
  return Math.round(Math.min(100, Math.max(0, baseline + burst + 3 * Math.sin(t * 1.7))) * 10) / 10;
}

export function createDemoHistory(now = Date.now()): CpuData {
  const timeline: number[] = [];
  const values: number[] = [];
  for (let timestamp = now - DAY; timestamp <= now; timestamp += SAMPLE_INTERVAL) {
    timeline.push(timestamp);
    values.push(demoCpuValue(timestamp));
  }
  return {timeline, values};
}

/** Keep a bounded 24-hour window, including after a suspended browser tab resumes. */
export function appendCpuSample(data: CpuData, timestamp: number, value: number | null): CpuData {
  const last = data.timeline[data.timeline.length - 1];
  if (!Number.isFinite(timestamp) || timestamp <= last) return data;
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) return data;
  let low = 0;
  let high = data.timeline.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (data.timeline[mid] < timestamp - DAY) low = mid + 1;
    else high = mid;
  }
  return {
    timeline: [...data.timeline.slice(low), timestamp],
    values: [...data.values.slice(low), value],
  };
}
