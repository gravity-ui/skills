export type CpuListener = (t: number, value: number) => void;

export interface CpuFeed {
  /** Timestamps in ms, ascending. Fixed-size sliding window. Do not mutate. */
  readonly timeline: readonly number[];
  /** CPU load in percent (0-100), parallel to `timeline`. Do not mutate. */
  readonly values: readonly number[];
  /** Start producing points. Safe to call again after `stop()`. */
  start(): void;
  /** Stop producing points. Subscriptions are kept. */
  stop(): void;
  /** Subscribe to new points. Returns an unsubscribe function. */
  subscribe(listener: CpuListener): () => void;
}

export interface CpuFeedOptions {
  /** Window length in ms */
  windowMs: number;
  /** Interval between points in ms */
  stepMs: number;
  now?: () => number;
  random?: () => number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Daily profile: lower at night, higher during the day. */
function baseLoad(t: number): number {
  return 30 + 18 * Math.sin((2 * Math.PI * t) / DAY_MS - 2);
}

/**
 * Simulated CPU metrics source. Replace with a real backend feed by keeping the
 * same `CpuFeed` shape.
 *
 * The window is pre-filled on creation so the chart has history immediately.
 * Timers are not started until `start()`, so an unused feed holds no resources.
 */
export function createSimulatedCpuFeed(opts: CpuFeedOptions): CpuFeed {
  const { windowMs, stepMs, now = Date.now, random = Math.random } = opts;
  const capacity = Math.max(1, Math.round(windowMs / stepMs));
  const timeline: number[] = [];
  const values: number[] = [];
  const listeners = new Set<CpuListener>();
  let timer: ReturnType<typeof setInterval> | undefined;
  let level = baseLoad(now());
  let burst = 0;

  const sample = (t: number): number => {
    if (random() < 0.003) burst = 20 + random() * 40;
    burst *= 0.9;
    const target = baseLoad(t) + burst;
    level += (target - level) * 0.15 + (random() - 0.5) * 4;
    return Math.min(100, Math.max(0, Math.round(level * 10) / 10));
  };

  const push = (t: number, v: number) => {
    timeline.push(t);
    values.push(v);
    if (timeline.length > capacity) {
      timeline.shift();
      values.shift();
    }
  };

  const start24hAgo = now() - windowMs;
  for (let i = 0; i < capacity; i++) {
    const t = start24hAgo + i * stepMs;
    push(t, sample(t));
  }

  const tick = () => {
    const t = now();
    const v = sample(t);
    push(t, v);
    for (const listener of listeners) listener(t, v);
  };

  return {
    timeline,
    values,
    start() {
      if (timer === undefined) timer = setInterval(tick, stepMs);
    },
    stop() {
      if (timer !== undefined) {
        clearInterval(timer);
        timer = undefined;
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
