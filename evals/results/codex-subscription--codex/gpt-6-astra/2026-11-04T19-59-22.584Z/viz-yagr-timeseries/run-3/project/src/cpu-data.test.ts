import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS} from './cpu-data';

const now = 2 * DAY_MS;
describe('CPU history', () => {
  it('retains chronological values after wrapping and bounds memory', () => {
    const buffer = new CpuBuffer(3);
    buffer.append([1, 2, 3, 4, 5].map(i => ({timestamp: now - 10 + i, value: i})), now);
    expect(buffer.snapshot()).toMatchObject({timeline: [now - 7, now - 6, now - 5], values: [3, 4, 5], average: 4, peak: 5});
  });
  it('expires data at the 24-hour boundary, including during a stream outage', () => {
    const buffer = new CpuBuffer();
    buffer.append([{timestamp: now - DAY_MS, value: 99}, {timestamp: now - DAY_MS + 1, value: 25}], now);
    expect(buffer.snapshot().values).toEqual([25]);
    buffer.prune(now + 1);
    expect(buffer.snapshot()).toMatchObject({timeline: [], values: [], current: null, average: null, peak: null});
  });
  it('corrects duplicates, rejects invalid/out-of-order samples, and preserves gaps', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: now - 2, value: 30}, {timestamp: now - 2, value: 40},
      {timestamp: now - 3, value: 10}, {timestamp: now - 1, value: null},
      {timestamp: now, value: 101}, {timestamp: now + 1, value: 40},
      {timestamp: NaN, value: 40}, {timestamp: now, value: Infinity},
    ], now);
    expect(buffer.snapshot()).toMatchObject({timeline: [now - 2, now - 1], values: [40, null], average: 40, current: null});
  });
  it('handles tens of thousands of samples without losing alignment', () => {
    const buffer = new CpuBuffer();
    buffer.append(Array.from({length: 43_200}, (_, i) => ({timestamp: now - (43_199 - i) * 2000, value: i % 101})), now);
    const snapshot = buffer.snapshot();
    expect(snapshot.timeline).toHaveLength(43_200);
    expect(snapshot.values).toHaveLength(snapshot.timeline.length);
    expect(snapshot.timeline.at(-1)).toBe(now);
  });
});
