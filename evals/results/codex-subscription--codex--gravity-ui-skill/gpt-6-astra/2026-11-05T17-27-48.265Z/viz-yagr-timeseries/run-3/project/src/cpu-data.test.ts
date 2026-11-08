import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS} from './cpu-data';

describe('CPU rolling buffer', () => {
  const now = DAY_MS * 2;

  it('keeps timestamps aligned with values when the ring wraps', () => {
    const buffer = new CpuBuffer(3);
    buffer.append(Array.from({length: 10}, (_, i) => ({timestamp: now - 10 + i, value: i})), now);
    expect(buffer.snapshot()).toEqual({timeline: [now - 3, now - 2, now - 1], values: [7, 8, 9]});
  });

  it('expires by wall clock, including when the stream stops', () => {
    const buffer = new CpuBuffer();
    buffer.append([{timestamp: now - DAY_MS, value: 10}, {timestamp: now, value: 20}], now);
    buffer.expire(now + 1);
    expect(buffer.snapshot().values).toEqual([20]);
    buffer.expire(now + DAY_MS + 1);
    expect(buffer.snapshot()).toEqual({timeline: [], values: []});
  });

  it('handles duplicates, missing data and rejects late, future or invalid samples', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: now - DAY_MS - 1, value: 50},
      {timestamp: now - 2, value: 30},
      {timestamp: now - 2, value: 40},
      {timestamp: now - 3, value: 20},
      {timestamp: now - 1, value: null},
      {timestamp: now, value: NaN},
      {timestamp: now, value: 101},
      {timestamp: now, value: -1},
      {timestamp: now + 1, value: 80},
    ], now);
    expect(buffer.snapshot()).toEqual({timeline: [now - 2, now - 1], values: [40, null]});
  });

  it('keeps tens of thousands of samples within the fixed memory limit', () => {
    const buffer = new CpuBuffer();
    buffer.append(Array.from({length: 120_000}, (_, i) => ({timestamp: now - 120_000 + i, value: i % 100})), now);
    expect(buffer.snapshot().timeline).toHaveLength(100_000);
    expect(buffer.snapshot().timeline[0]).toBe(now - 100_000);
  });
});
