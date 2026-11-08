/**
 * Mock realtime source of CPU load. Replace `createCpuStream` with a real
 * transport (WebSocket / SSE / polling) that implements the same `CpuSource`.
 */

export const STEP_MS = 2_000;
export const WINDOW_MS = 24 * 60 * 60 * 1000;
export const WINDOW_POINTS = WINDOW_MS / STEP_MS; // 43 200 points

export interface CpuPoints {
  /** Unix timestamps, ms, ascending */
  timeline: number[];
  /** CPU load, % (0..100), same length as `timeline` */
  values: number[];
}

export interface CpuSource {
  /** Full history for the last 24 hours */
  getHistory(): CpuPoints;
  /** Subscribe to new points. Returns unsubscribe. */
  subscribe(listener: (points: CpuPoints) => void): () => void;
}

function cpuAt(t: number, noise: number): number {
  const day = (t / WINDOW_MS) * 2 * Math.PI;
  const base = 38 + 14 * Math.sin(day - 1.5); // daily load curve
  const wave = 6 * Math.sin(t / 420_000);
  const spike = Math.sin(t / 3_100_000) > 0.93 ? 28 : 0;
  return Math.min(100, Math.max(0, base + wave + spike + noise));
}

export function createCpuStream(now = Date.now()): CpuSource {
  const end = Math.floor(now / STEP_MS) * STEP_MS;
  const timeline = new Array<number>(WINDOW_POINTS);
  const values = new Array<number>(WINDOW_POINTS);
  for (let i = 0; i < WINDOW_POINTS; i++) {
    const t = end - (WINDOW_POINTS - 1 - i) * STEP_MS;
    timeline[i] = t;
    values[i] = cpuAt(t, (Math.random() - 0.5) * 6);
  }

  let last = timeline[WINDOW_POINTS - 1];
  const listeners = new Set<(points: CpuPoints) => void>();
  let timer: ReturnType<typeof setInterval> | undefined;

  const tick = () => {
    // Catch up if the tab was throttled in the background
    const target = Math.floor(Date.now() / STEP_MS) * STEP_MS;
    const points: CpuPoints = {timeline: [], values: []};
    for (let t = last + STEP_MS; t <= target; t += STEP_MS) {
      points.timeline.push(t);
      points.values.push(cpuAt(t, (Math.random() - 0.5) * 6));
    }
    if (!points.timeline.length) return;
    last = points.timeline[points.timeline.length - 1];
    listeners.forEach((l) => l(points));
  };

  return {
    getHistory: () => ({timeline: timeline.slice(), values: values.slice()}),
    subscribe(listener) {
      listeners.add(listener);
      timer ??= setInterval(tick, STEP_MS);
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
