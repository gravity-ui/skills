import {afterEach, describe, expect, it, vi} from 'vitest';
import {CpuBuffer, DAY_MS, demoCpuSource} from './cpu-source';

const now = DAY_MS * 2;

describe('CPU rolling window', () => {
  it('retains exactly the last day and expires data even if the source stops', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: now - DAY_MS - 1, value: 10},
      {timestamp: now - DAY_MS, value: 20},
      {timestamp: now, value: 30},
    ], now);
    expect(buffer.snapshot(now)).toEqual([[now - DAY_MS, now], [20, 30]]);
    expect(buffer.snapshot(now + 1)).toEqual([[now], [30]]);
    expect(buffer.snapshot(now + DAY_MS + 1)).toEqual([[], []]);
  });

  it('wraps the ring without losing alignment between timestamps and values', () => {
    const buffer = new CpuBuffer(3);
    buffer.append(Array.from({length: 10}, (_, i) => ({timestamp: now - 10 + i, value: i})), now);
    expect(buffer.snapshot(now)).toEqual([[now - 3, now - 2, now - 1], [7, 8, 9]]);
  });

  it('updates duplicate timestamps, preserves gaps and rejects bad or late samples', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: now - 2, value: 10},
      {timestamp: now - 2, value: 25},
      {timestamp: now - 3, value: 99},
      {timestamp: now - 1, value: null},
      {timestamp: now, value: NaN},
      {timestamp: now, value: 101},
      {timestamp: now, value: -1},
      {timestamp: Infinity, value: 5},
      {timestamp: now + 1, value: 5},
    ], now);
    expect(buffer.snapshot(now)).toEqual([[now - 2, now - 1], [25, null]]);
  });

  it('keeps snapshots stable as new measurements arrive', () => {
    const buffer = new CpuBuffer(2);
    buffer.append([{timestamp: now - 1, value: 0}], now);
    const first = buffer.snapshot(now);
    buffer.append([{timestamp: now, value: 100}], now);
    expect(first).toEqual([[now - 1], [0]]);
    expect(buffer.snapshot(now)).toEqual([[now - 1, now], [0, 100]]);
  });

  it('bounds a stream larger than 100,000 samples', () => {
    const buffer = new CpuBuffer();
    buffer.append(Array.from({length: 120_000}, (_, i) => ({timestamp: now - 120_000 + i, value: i % 101})), now);
    const [timeline, values] = buffer.snapshot(now);
    expect(timeline).toHaveLength(100_000);
    expect(values).toHaveLength(timeline.length);
    expect(timeline[0]).toBe(now - 100_000);
    expect(timeline.at(-1)).toBe(now - 1);
  });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

it('provides a full demo history and stops all emissions on unsubscribe/remount', () => {
  vi.useFakeTimers();
  vi.stubGlobal('window', {setInterval, clearInterval});
  const emit = vi.fn();
  const unsubscribe = demoCpuSource.subscribe(emit, vi.fn());
  expect(emit.mock.calls[0][0]).toHaveLength(43_201);
  vi.advanceTimersByTime(2000);
  expect(emit).toHaveBeenCalledTimes(3);
  unsubscribe();
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(2000);
  expect(emit).toHaveBeenCalledTimes(3);
  const unsubscribeAgain = demoCpuSource.subscribe(emit, vi.fn());
  expect(vi.getTimerCount()).toBe(1);
  unsubscribeAgain();
  expect(vi.getTimerCount()).toBe(0);
});
