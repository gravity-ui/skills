import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS, demoCpuSource} from './cpu-data';

describe('CPU history', () => {
  it('keeps timestamps and values aligned when the ring wraps', () => {
    const buffer = new CpuBuffer(3);
    buffer.append([1, 2, 3, 4, 5].map((timestamp) => ({timestamp, value: timestamp * 10})));
    expect(buffer.snapshot()).toMatchObject({timeline: [3, 4, 5], values: [30, 40, 50], current: 50, average: 40, maximum: 50, p95: 50});
  });

  it('expires history outside the 24-hour window, retaining its exact boundary', () => {
    const buffer = new CpuBuffer();
    buffer.append([{timestamp: 0, value: 1}, {timestamp: 1, value: 2}, {timestamp: DAY_MS, value: 3}]);
    expect(buffer.snapshot().timeline).toEqual([0, 1, DAY_MS]);
    buffer.append([{timestamp: DAY_MS + 1, value: 4}]);
    expect(buffer.snapshot().timeline).toEqual([1, DAY_MS, DAY_MS + 1]);
  });

  it('ignores invalid or out-of-order points and accepts a correction to the latest point', () => {
    const buffer = new CpuBuffer();
    buffer.append([{timestamp: 2, value: 10}, {timestamp: 1, value: 80}, {timestamp: 3, value: NaN},
      {timestamp: Infinity, value: 10}, {timestamp: 4, value: 101}, {timestamp: 4, value: -1}, {timestamp: 2, value: 25}]);
    expect(buffer.snapshot()).toMatchObject({timeline: [2], values: [25], average: 25});
  });

  it('computes P95 without letting a single spike dominate it', () => {
    const buffer = new CpuBuffer();
    buffer.append(Array.from({length: 100}, (_, timestamp) => ({timestamp, value: timestamp === 99 ? 100 : 20})));
    expect(buffer.snapshot()).toMatchObject({maximum: 100, p95: 20, average: 20.8});
  });

  it('loads a complete day of more than 43,000 valid points', async () => {
    const samples = await demoCpuSource.loadHistory(new AbortController().signal);
    const buffer = new CpuBuffer();
    buffer.append(samples);
    const result = buffer.snapshot();
    expect(result.timeline).toHaveLength(43_201);
    expect(result.timeline.at(-1)! - result.timeline[0]).toBe(DAY_MS);
    expect(result.values.every((value) => Number.isFinite(value) && value >= 0 && value <= 100)).toBe(true);
  });
});
