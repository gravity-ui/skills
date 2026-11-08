export const DAY_MS = 24 * 60 * 60 * 1000;
/** One sample every 2 seconds → 43 200 points per day. */
export const STEP_MS = 2000;

export interface CpuBuffer {
  /** Timestamps, ms. */
  timeline: number[];
  /** CPU load, %. */
  values: number[];
}

/** Smooth pseudo-random CPU load with daily rhythm and short spikes. */
function sample(t: number, prev: number): number {
  const hours = (t % DAY_MS) / 3_600_000;
  const base = 35 + 20 * Math.sin(((hours - 9) / 24) * Math.PI * 2);
  const noise = (Math.random() - 0.5) * 8;
  const spike = Math.random() < 0.002 ? 30 + Math.random() * 30 : 0;
  const next = prev * 0.7 + (base + noise) * 0.3 + spike;
  return Math.round(Math.min(100, Math.max(0, next)) * 10) / 10;
}

export function createInitialCpuBuffer(now = Date.now()): CpuBuffer {
  const count = Math.floor(DAY_MS / STEP_MS);
  const timeline = new Array<number>(count);
  const values = new Array<number>(count);
  let prev = 40;
  for (let i = 0; i < count; i++) {
    const t = now - (count - 1 - i) * STEP_MS;
    prev = sample(t, prev);
    timeline[i] = t;
    values[i] = prev;
  }
  return {timeline, values};
}

export function nextCpuPoint(last: {t: number; v: number}): {t: number; v: number} {
  const t = Math.max(Date.now(), last.t + 1);
  return {t, v: sample(t, last.v)};
}
