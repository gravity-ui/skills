import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS} from './cpuData';

describe('CpuBuffer', () => {
  it('keeps only the rolling day, preserving the boundary and missing measurements', () => {
    const now = DAY_MS * 2;
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: now - DAY_MS - 1, value: 99},
      {timestamp: now - DAY_MS, value: 0},
      {timestamp: now - 1, value: 70},
      {timestamp: now, value: null},
    ], now);
    expect(buffer.snapshot()).toMatchObject({
      timeline: [now - DAY_MS, now - 1, now], values: [0, 70, null],
      count: 2, current: null, average: 35, max: 70,
    });
    expect(buffer.prune(now + DAY_MS + 1)).toBe(true);
    expect(buffer.snapshot()).toMatchObject({timeline: [], current: null, average: null, max: null});
  });

  it('wraps at capacity and applies corrections without duplicating timestamps', () => {
    const buffer = new CpuBuffer(3);
    buffer.append(Array.from({length: 10}, (_, i) => ({timestamp: i, value: i})), 20);
    buffer.append([{timestamp: 9, value: 80}, {timestamp: 8, value: 100}], 20);
    expect(buffer.snapshot()).toMatchObject({timeline: [7, 8, 9], values: [7, 8, 80]});
  });

  it('rejects invalid timestamps and CPU values without poisoning subsequent samples', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: NaN, value: 10}, {timestamp: 1, value: Infinity},
      {timestamp: 2, value: -1}, {timestamp: 3, value: 101},
      {timestamp: 20, value: 50}, {timestamp: 4, value: 100},
    ], 10);
    expect(buffer.snapshot()).toMatchObject({timeline: [4], values: [100]});
  });

  it('bounds a burst of 150,000 samples while retaining ordered, aligned arrays', () => {
    const buffer = new CpuBuffer();
    buffer.append(Array.from({length: 150_000}, (_, timestamp) =>
      ({timestamp, value: timestamp % 101})), 150_000);
    const data = buffer.snapshot();
    expect(data.timeline).toHaveLength(100_000);
    expect(data.values).toHaveLength(100_000);
    expect(data.timeline[0]).toBe(50_000);
    expect(data.timeline.at(-1)).toBe(149_999);
    expect(data.values.at(-1)).toBe(149_999 % 101);
  });
});
