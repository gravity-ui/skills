export const DAY_MS = 24 * 60 * 60 * 1_000;
const SAMPLE_MS = 2_000;

/** Immutable, aligned arrays. Timestamps are ascending Unix milliseconds;
 * values are CPU percentages (0–100), or null for a missing measurement.
 */
export interface CpuData {
  timeline: readonly number[];
  values: readonly (number | null)[];
}

export function lowerBound(timeline: readonly number[], timestamp: number): number {
  let low = 0;
  let high = timeline.length;
  while (low < high) {
    const mid = (low + high) >>> 1;
    if (timeline[mid] < timestamp) low = mid + 1;
    else high = mid;
  }
  return low;
}

/** Copy only the visible day. Never let the chart mutate the source arrays. */
export function dayWindow(data: CpuData, now: number) {
  const start = lowerBound(data.timeline, now - DAY_MS);
  const end = lowerBound(data.timeline, now + 1);
  return {timeline: data.timeline.slice(start, end), values: data.values.slice(start, end)};
}

function demoValue(timestamp: number): number {
  const t = timestamp / 1_000;
  const baseline = 32 + 13 * Math.sin(t / 5_000) + 7 * Math.sin(t / 360);
  const burst = 33 * Math.max(0, Math.sin(t / 950)) ** 18;
  return Math.round(Math.min(100, Math.max(0, baseline + burst + 4 * Math.sin(t * 1.7))) * 10) / 10;
}

export function createDemoHistory(now = Date.now()): CpuData {
  const end = Math.floor(now / SAMPLE_MS) * SAMPLE_MS;
  const timeline = Array.from({length: DAY_MS / SAMPLE_MS + 1}, (_, i) => end - DAY_MS + i * SAMPLE_MS);
  return {timeline, values: timeline.map(demoValue)};
}

export function nextDemoHistory(previous: CpuData, now: number): CpuData {
  const timestamp = Math.floor(now / SAMPLE_MS) * SAMPLE_MS;
  if (timestamp <= (previous.timeline.at(-1) ?? -Infinity)) return previous;
  const next = dayWindow(previous, timestamp);
  // Background tabs may skip timer ticks. Do not invent measurements for the gap.
  const last = next.timeline.at(-1);
  if (last !== undefined && timestamp - last > SAMPLE_MS * 2) {
    next.timeline.push(last + SAMPLE_MS);
    next.values.push(null);
  }
  next.timeline.push(timestamp);
  next.values.push(demoValue(timestamp));
  return next;
}
