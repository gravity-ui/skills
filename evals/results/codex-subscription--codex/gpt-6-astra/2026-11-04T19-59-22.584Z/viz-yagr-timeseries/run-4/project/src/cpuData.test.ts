import {describe, expect, it} from 'vitest';
import {createDemoHistory, DAY_MS, dayWindow, nextDemoHistory} from './cpuData';

describe('CPU history', () => {
  it('keeps the inclusive day boundary, aligns values, and excludes future points', () => {
    const now = DAY_MS * 2;
    const data = {timeline: [0, now - DAY_MS, now, now + 1], values: [10, null, 80, 90]};
    expect(dayWindow(data, now)).toEqual({timeline: [now - DAY_MS, now], values: [null, 80]});
    expect(data.timeline).toHaveLength(4);
  });

  it('keeps over 43,000 points bounded after repeated real-time updates', () => {
    const now = DAY_MS * 2;
    let data = createDemoHistory(now);
    expect(data.timeline).toHaveLength(43_201);
    for (let tick = 1; tick <= 100; tick++) {
      data = nextDemoHistory(data, now + tick * 2_000);
    }
    expect(data.timeline).toHaveLength(43_201);
    expect(data.values).toHaveLength(data.timeline.length);
    expect(data.timeline.at(-1)! - data.timeline[0]).toBe(DAY_MS);
    expect(data.values.every((value) => value !== null && value >= 0 && value <= 100)).toBe(true);
  });

  it('ignores duplicate ticks and marks gaps instead of fabricating a continuous line', () => {
    const data = createDemoHistory(DAY_MS);
    expect(nextDemoHistory(data, DAY_MS + 10)).toBe(data);
    const delayed = nextDemoHistory(data, DAY_MS + 60_000);
    expect(delayed.values.at(-2)).toBeNull();
    expect(delayed.timeline.at(-1)).toBe(DAY_MS + 60_000);
    const nextDay = nextDemoHistory(data, DAY_MS * 3);
    expect(nextDay.timeline).toEqual([DAY_MS * 3]);
  });
});
