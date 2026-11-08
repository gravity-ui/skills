/**
 * Simulated CPU telemetry: a sliding 24h window at 1s resolution
 * (86 400 points — "several tens of thousands").
 *
 * Framework-free on purpose: the chart component owns the feed imperatively,
 * so realtime ticks never go through React re-renders.
 */

export const SAMPLE_MS = 1000;
export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const WINDOW_SIZE = WINDOW_MS / SAMPLE_MS;

export type CpuFeed = (t: number) => number;

/** Daily baseline: quieter at night, busier around mid-day. */
function baseline(t: number): number {
  const phase = ((t % WINDOW_MS) / WINDOW_MS) * Math.PI * 2;
  return 34 + 16 * Math.sin(phase - Math.PI / 2.2) + 5 * Math.sin(3 * phase + 0.8);
}

/**
 * Mean-reverting random walk around the daily baseline with occasional
 * spikes (deploys, batch jobs). Returns a function that produces the next
 * sample for a timestamp.
 */
export function createCpuFeed(): CpuFeed {
  let prev = baseline(Date.now());
  return (t: number) => {
    let v = prev + (baseline(t) - prev) * 0.03 + (Math.random() - 0.5) * 5;
    if (Math.random() < 0.002) {
      v += 20 + Math.random() * 35;
    }
    v = Math.min(99, Math.max(1, v));
    prev = v;
    return Math.round(v * 10) / 10;
  };
}

export interface CpuWindow {
  timeline: number[];
  values: (number | null)[];
}

/** Backfills the last 24h so the chart opens with a full window. */
export function generateInitialWindow(feed: CpuFeed, now: number = Date.now()): CpuWindow {
  const timeline = new Array<number>(WINDOW_SIZE);
  const values = new Array<number>(WINDOW_SIZE);
  const start = now - (WINDOW_SIZE - 1) * SAMPLE_MS;
  for (let i = 0; i < WINDOW_SIZE; i++) {
    timeline[i] = start + i * SAMPLE_MS;
    values[i] = feed(timeline[i]);
  }
  return {timeline, values};
}

export interface CpuStats {
  current: number | null;
  avg: number | null;
  max: number | null;
}

/**
 * Single pass over the window (~86k numbers, sub-millisecond) — cheap enough
 * to run on every tick without any incremental bookkeeping.
 */
export function computeStats(values: ArrayLike<number | string | null>): CpuStats {
  let sum = 0;
  let max = -Infinity;
  let n = 0;
  let current: number | null = null;
  for (let i = 0; i < values.length; i++) {
    const raw = values[i];
    if (raw == null) continue;
    const v = typeof raw === 'string' ? Number(raw) : raw;
    if (Number.isNaN(v)) continue;
    sum += v;
    n += 1;
    if (v > max) max = v;
  }
  if (values.length > 0) {
    const last = values[values.length - 1];
    const v = typeof last === 'string' ? Number(last) : last;
    current = v == null || Number.isNaN(v) ? null : v;
  }
  return {
    current,
    avg: n > 0 ? sum / n : null,
    max: n > 0 ? max : null,
  };
}

export function formatPercent(v: number | null, digits = 1): string {
  return v == null ? '—' : `${v.toFixed(digits)}%`;
}
