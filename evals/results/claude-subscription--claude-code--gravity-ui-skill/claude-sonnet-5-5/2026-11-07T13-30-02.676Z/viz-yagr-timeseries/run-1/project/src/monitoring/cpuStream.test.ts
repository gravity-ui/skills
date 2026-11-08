import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

import {STEP_MS, WINDOW_POINTS, createCpuStream} from './cpuStream';

describe('createCpuStream', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns a 24h history with ascending timestamps and values in 0..100', () => {
    const {timeline, values} = createCpuStream().getHistory();
    expect(timeline).toHaveLength(WINDOW_POINTS);
    expect(values).toHaveLength(WINDOW_POINTS);
    expect(timeline.every((t, i) => i === 0 || t - timeline[i - 1] === STEP_MS)).toBe(true);
    expect(values.every((v) => v >= 0 && v <= 100)).toBe(true);
  });

  it('emits new points and stops the timer after the last unsubscribe', () => {
    const source = createCpuStream();
    const last = source.getHistory().timeline.at(-1)!;
    const listener = vi.fn();
    const unsubscribe = source.subscribe(listener);

    vi.advanceTimersByTime(STEP_MS * 3);
    expect(listener).toHaveBeenCalled();
    const first = listener.mock.calls[0][0];
    expect(first.timeline[0]).toBe(last + STEP_MS);

    unsubscribe();
    expect(vi.getTimerCount()).toBe(0);
  });
});
