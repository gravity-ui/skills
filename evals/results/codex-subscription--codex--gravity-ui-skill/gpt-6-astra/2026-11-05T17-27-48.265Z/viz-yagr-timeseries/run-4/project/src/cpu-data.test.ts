import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS, MAX_POINTS} from './cpu-data';

const now = 2 * DAY_MS;
describe('CPU history buffer', () => {
  it('keeps only the last day and prunes a disconnected stream', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: now - DAY_MS - 1, value: 10},
      {timestamp: now - DAY_MS, value: 20},
      {timestamp: now, value: 30},
    ], now);
    expect(buffer.snapshot().values).toEqual([20, 30]);
    expect(buffer.prune(now + DAY_MS + 1)).toBe(true);
    expect(buffer.snapshot().count).toBe(0);
  });

  it('bounds memory at high rates and preserves chronological order on wraparound', () => {
    const buffer = new CpuBuffer();
    buffer.append(Array.from({length: MAX_POINTS + 50}, (_, i) => ({timestamp: now - MAX_POINTS - 50 + i, value: i % 100})), now);
    const result = buffer.snapshot();
    expect(result.count).toBe(MAX_POINTS);
    expect(result.timeline[0]).toBe(now - MAX_POINTS);
    expect(result.timeline.at(-1)).toBe(now - 1);
    expect(result.values.at(-1)).toBe(49);
  });

  it('updates duplicate timestamps, drops late/invalid samples and preserves gaps', () => {
    const buffer = new CpuBuffer(3);
    buffer.append([{timestamp: now - 2, value: 0}, {timestamp: now - 1, value: 50}], now);
    buffer.append([
      {timestamp: now - 1, value: 100},
      {timestamp: now - 2, value: 20},
      {timestamp: NaN, value: 20},
      {timestamp: now + 1, value: 20},
      {timestamp: now, value: Infinity},
      {timestamp: now, value: -1},
      {timestamp: now, value: 101},
      {timestamp: now, value: null},
    ], now);
    expect(buffer.snapshot()).toMatchObject({values: [0, 100, null], average: 50, peak: 100, current: null});
  });

  it('has no invented zero values for empty or entirely missing metrics', () => {
    const buffer = new CpuBuffer();
    expect(buffer.snapshot()).toMatchObject({average: null, current: null, peak: null});
    buffer.append([{timestamp: now, value: null}], now);
    expect(buffer.snapshot()).toMatchObject({average: null, current: null, peak: null});
  });
});
