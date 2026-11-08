import {describe, expect, it} from 'vitest';
import {appendCpuSample, createDemoHistory, DAY, SAMPLE_INTERVAL} from './cpuData';

describe('CPU time window', () => {
  const now = 1_800_000_000_000;

  it('generates aligned full-day history with tens of thousands of valid samples', () => {
    const data = createDemoHistory(now);
    expect(data.timeline.length).toBe(43_201);
    expect(data.timeline.length).toBe(data.values.length);
    expect(data.timeline[0]).toBe(now - DAY);
    expect(data.timeline.at(-1)).toBe(now);
    expect(data.values.every((value) => value !== null && value >= 0 && value <= 100)).toBe(true);
  });

  it('evicts expired samples without mutating the previous snapshot', () => {
    const previous = createDemoHistory(now);
    const next = appendCpuSample(previous, now + SAMPLE_INTERVAL, 55);
    expect(next.timeline.length).toBe(previous.timeline.length);
    expect(next.timeline[0]).toBe(now - DAY + SAMPLE_INTERVAL);
    expect(next.values.at(-1)).toBe(55);
    expect(previous.timeline.at(-1)).toBe(now);
    expect(previous.values.at(-1)).not.toBe(55);
  });

  it('discards stale history after a long suspension and accepts missing metrics', () => {
    const next = appendCpuSample(createDemoHistory(now), now + 2 * DAY, null);
    expect(next).toEqual({timeline: [now + 2 * DAY], values: [null]});
    expect(appendCpuSample({timeline: [], values: []}, now, 0)).toEqual({timeline: [now], values: [0]});
  });

  it('rejects duplicate, unordered, or invalid samples', () => {
    const data = createDemoHistory(now);
    for (const [timestamp, value] of [[now, 40], [now - 10, 40], [NaN, 40], [now + 1, NaN], [now + 1, 101], [now + 1, -1]]) {
      expect(appendCpuSample(data, timestamp, value)).toBe(data);
    }
  });
});
