import {afterEach, describe, expect, it, vi} from 'vitest';
import {CpuBuffer, createDemoCpuSource, DAY_MS, SAMPLE_MS} from './cpuData';

afterEach(() => vi.useRealTimers());

describe('CPU history', () => {
  it('keeps timestamps and values aligned when the ring wraps', () => {
    const buffer = new CpuBuffer(3);
    for (let i = 0; i < 10; i++) buffer.append(i, i * 10);
    expect(buffer.snapshot()).toEqual({timeline: [7, 8, 9], values: [70, 80, 90]});
  });

  it('drops expired history after a gap while keeping the 24-hour boundary', () => {
    const buffer = new CpuBuffer(10);
    buffer.append(0, 10);
    buffer.append(1, 20);
    buffer.append(DAY_MS, 30);
    expect(buffer.snapshot().timeline).toEqual([0, 1, DAY_MS]);
    buffer.append(DAY_MS * 3, 40);
    expect(buffer.snapshot()).toEqual({timeline: [DAY_MS * 3], values: [40]});
  });

  it('ignores invalid, duplicate and out-of-order samples', () => {
    const buffer = new CpuBuffer(3);
    buffer.append(10, 50);
    for (const [time, value] of [[9, 20], [10, 20], [11, -1], [12, 101], [13, NaN], [Infinity, 20]]) {
      buffer.append(time, value);
    }
    expect(buffer.snapshot()).toEqual({timeline: [10], values: [50]});
  });

  it('returns independent snapshots', () => {
    const buffer = new CpuBuffer(2);
    buffer.append(1, 10);
    const snapshot = buffer.snapshot();
    buffer.append(2, 20);
    snapshot.values[0] = 90;
    expect(buffer.snapshot()).toEqual({timeline: [1, 2], values: [10, 20]});
  });

  it('shares one timer, releases it and can subscribe again after cleanup', () => {
    vi.useFakeTimers();
    const source = createDemoCpuSource();
    expect(vi.getTimerCount()).toBe(0);
    const initial = source.getSnapshot();
    expect(initial.timeline).toHaveLength(DAY_MS / SAMPLE_MS + 1);
    expect(initial.timeline.at(-1)! - initial.timeline[0]).toBe(DAY_MS);
    const first = vi.fn();
    const second = vi.fn();
    const stopFirst = source.subscribe(first);
    const stopSecond = source.subscribe(second);
    expect(vi.getTimerCount()).toBe(1);
    vi.advanceTimersByTime(SAMPLE_MS * 3);
    expect(first).toHaveBeenCalledTimes(3);
    expect(source.getSnapshot().timeline).toHaveLength(initial.timeline.length);
    stopFirst();
    vi.advanceTimersByTime(SAMPLE_MS);
    expect(first).toHaveBeenCalledTimes(3);
    expect(second).toHaveBeenCalledTimes(4);
    stopSecond();
    expect(vi.getTimerCount()).toBe(0);
    const stopAgain = source.subscribe(first);
    expect(vi.getTimerCount()).toBe(1);
    stopAgain();
    expect(vi.getTimerCount()).toBe(0);
  });
});
