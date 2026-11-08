import {useEffect, useState} from 'react';

import {type CpuFeed, createSimulatedCpuFeed} from './cpuFeed';

const WINDOW_MS = 24 * 60 * 60 * 1000;
const STEP_MS = 2000;

/** Owns the feed for the component's lifetime: timers start on mount and stop on unmount. */
export function useCpuFeed(): CpuFeed {
  const [feed] = useState(() => createSimulatedCpuFeed({windowMs: WINDOW_MS, stepMs: STEP_MS}));

  useEffect(() => {
    feed.start();
    return () => feed.stop();
  }, [feed]);

  return feed;
}

export interface CpuStats {
  current: number;
  average: number;
  max: number;
}

export function computeCpuStats(values: readonly number[]): CpuStats {
  if (values.length === 0) return {current: 0, average: 0, max: 0};
  let sum = 0;
  let max = -Infinity;
  for (const v of values) {
    sum += v;
    if (v > max) max = v;
  }
  return {current: values[values.length - 1], average: sum / values.length, max};
}

/** Statistics over the current window, refreshed on every new point. */
export function useCpuStats(feed: CpuFeed): CpuStats {
  const [stats, setStats] = useState(() => computeCpuStats(feed.values));

  useEffect(() => feed.subscribe(() => setStats(computeCpuStats(feed.values))), [feed]);

  return stats;
}
