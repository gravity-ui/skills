import {describe, expect, it, vi, afterEach} from 'vitest';
import {CpuWindow, DAY_MS, createDemoCpuSource} from './cpu-data';

const now = 1_800_000_000_000;

afterEach(() => vi.useRealTimers());

describe('CpuWindow', () => {
  it('keeps the latest samples when a large stream wraps the ring', () => {
    const data = new CpuWindow(3);
    data.append(Array.from({length: 100_000}, (_, i) => ({timestamp: now + i, value: i % 101})));
    const snapshot = data.snapshot(now + 100_000);
    expect(snapshot.timeline).toEqual([now + 99_997, now + 99_998, now + 99_999]);
    expect(snapshot.values).toEqual([7, 8, 9]);
    expect(snapshot.stats).toMatchObject({points: 3, current: 9, average: 8, max: 9});
  });

  it('expires samples outside the day, including during an idle stream', () => {
    const data = new CpuWindow();
    data.append([{timestamp: now - DAY_MS - 1, value: 100}, {timestamp: now - DAY_MS, value: 30}, {timestamp: now, value: 10}]);
    expect(data.snapshot(now).values).toEqual([30, 10]);
    expect(data.snapshot(now + DAY_MS + 1).stats).toEqual({points: 0, current: null, average: null, max: null, updatedAt: null});
  });

  it('replaces duplicate timestamps and rejects late and invalid samples', () => {
    const data = new CpuWindow();
    data.append([{timestamp: now, value: 20}, {timestamp: now, value: 40},
      {timestamp: now - 1, value: 70}, {timestamp: NaN, value: 20},
      {timestamp: now + 1, value: Infinity}, {timestamp: now + 2, value: -1},
      {timestamp: now + 3, value: 101}, {timestamp: now + 4, value: null}]);
    const snapshot = data.snapshot(now + 4);
    expect(snapshot.timeline).toEqual([now, now + 4]);
    expect(snapshot.values).toEqual([40, null]);
    expect(snapshot.stats).toMatchObject({average: 40, max: 40, current: null});
  });

  it('returns independent snapshots and handles zero utilization', () => {
    const data = new CpuWindow(1);
    data.append([{timestamp: now, value: 0}]);
    const first = data.snapshot(now);
    data.append([{timestamp: now + 1, value: 100}]);
    expect(first.values).toEqual([0]);
    expect(first.stats).toMatchObject({average: 0, max: 0, current: 0});
    expect(data.snapshot(now + 1).values).toEqual([100]);
  });
});

describe('demo source', () => {
  it('generates a day of ordered dense history and respects cancellation', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const source = createDemoCpuSource();
    const controller = new AbortController();
    const history = await source.loadHistory(controller.signal);
    expect(history).toHaveLength(43_201);
    expect(history.at(-1)!.timestamp - history[0].timestamp).toBe(DAY_MS);
    expect(history.every((sample, i) => sample.value! >= 0 && sample.value! <= 100 && (!i || sample.timestamp > history[i - 1].timestamp))).toBe(true);
    controller.abort();
    await expect(source.loadHistory(controller.signal)).rejects.toThrow();
  });
});
