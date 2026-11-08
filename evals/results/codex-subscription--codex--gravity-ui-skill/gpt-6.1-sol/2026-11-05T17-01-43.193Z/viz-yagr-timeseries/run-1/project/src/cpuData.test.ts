import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS} from './cpuData';

describe('CpuBuffer', () => {
  it('keeps timestamps and values aligned when the ring wraps', () => {
    const buffer = new CpuBuffer(3);
    buffer.append([1, 2, 3, 4, 5].map((timestamp) => ({timestamp, value: timestamp * 10})), 5);
    expect(buffer.snapshot()).toEqual({timeline: [3, 4, 5], data: [30, 40, 50],
      count: 3, current: 50, average: 40, peak: 50});
  });

  it('expires history against wall clock even without incoming samples', () => {
    const buffer = new CpuBuffer();
    buffer.append([{timestamp: 1, value: 5}, {timestamp: 2, value: 10}], DAY_MS + 1);
    expect(buffer.snapshot().count).toBe(2);
    expect(buffer.expire(DAY_MS + 2)).toBe(true);
    expect(buffer.snapshot().timeline).toEqual([2]);
    buffer.expire(DAY_MS + 3);
    expect(buffer.snapshot()).toMatchObject({timeline: [], data: [], count: 0,
      current: undefined, average: undefined, peak: undefined});
  });

  it('handles duplicates and drops invalid, future and out-of-order packets', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: -DAY_MS, value: 20}, {timestamp: 1, value: 10},
      {timestamp: 1, value: 25}, {timestamp: 0, value: 40},
      {timestamp: 2, value: NaN}, {timestamp: 3, value: 101},
      {timestamp: 4, value: -1}, {timestamp: NaN, value: 20},
      {timestamp: 11, value: 20}, {timestamp: 10, value: 0},
    ], 10);
    expect(buffer.snapshot().timeline).toEqual([1, 10]);
    expect(buffer.snapshot().data).toEqual([25, 0]);
  });

  it('processes a dense day and repeated live updates within bounded storage', () => {
    const now = DAY_MS * 2;
    const buffer = new CpuBuffer(50_000);
    buffer.append(Array.from({length: 43_201}, (_, i) => ({timestamp: now - DAY_MS + i * 2000, value: i % 101})), now);
    for (let i = 1; i <= 10_000; i++) buffer.append([{timestamp: now + i * 2000, value: 42}], now + i * 2000);
    const snapshot = buffer.snapshot();
    expect(snapshot.count).toBe(43_201);
    expect(snapshot.timeline[0]).toBe(now + 20_000_000 - DAY_MS);
    expect(snapshot.timeline.at(-1)).toBe(now + 20_000_000);
    expect(snapshot.current).toBe(42);
  });
});
