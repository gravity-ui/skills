import {describe, expect, it} from 'vitest';
import {createDataset, getSummary} from './data';

describe('shared widget datasets', () => {
  it('keeps the same sales observations when the visible period changes', () => {
    const short = createDataset('sales', 7);
    const long = createDataset('sales', 90);
    expect(short.timeline).toEqual(long.timeline.slice(-7));
    expect(short.current).toEqual(long.current.slice(-7));
    expect(short.previous).toEqual(long.previous.slice(-7));
  });
  it.each([1, 6, 24])('provides an aligned dense monitoring series for %s hours', hours => {
    const data = createDataset('monitoring', hours);
    expect(data.timeline).toHaveLength(hours * 600);
    expect(data.current.length).toBe(data.timeline.length);
    expect(data.previous.length).toBe(data.timeline.length);
    expect(new Set(data.timeline).size).toBe(data.timeline.length);
    expect(data.timeline.every((time, index) => !index || time - data.timeline[index - 1] === 6000)).toBe(true);
    expect(data.current.every(value => Number.isFinite(value) && value >= 0)).toBe(true);
  });
  it('advances monitoring without changing observations already in the window', () => {
    const before = createDataset('monitoring', 1, 0);
    const after = createDataset('monitoring', 1, 1);
    expect(after.timeline.slice(0, -1)).toEqual(before.timeline.slice(1));
    expect(after.current.slice(0, -1)).toEqual(before.current.slice(1));
    expect(after.previous.slice(0, -1)).toEqual(before.previous.slice(1));
  });
  it('derives summary values from the displayed observations', () => {
    expect(getSummary({timeline: [1, 2], current: [100, 200], previous: [100, 100]})).toEqual({total: 300, previousTotal: 200, average: 150, max: 200, change: 50});
  });
});
