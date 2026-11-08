import {describe, expect, it} from 'vitest';
import {CpuWindow, DAY_MS} from './cpuData';

describe('CPU rolling history', () => {
  it('keeps the last 24 hours and expires data even without new samples', () => {
    const window = new CpuWindow();
    window.append([
      {timestamp: 0, value: 10},
      {timestamp: 1, value: 20},
      {timestamp: DAY_MS, value: 30},
    ], DAY_MS);
    expect(window.snapshot(DAY_MS + 1).timeline).toEqual([1, DAY_MS]);
    expect(window.snapshot(2 * DAY_MS + 1)).toEqual({timeline: [], values: [], count: 0, latest: null});
  });

  it('keeps timestamps and values aligned across 50,000 live updates', () => {
    const window = new CpuWindow();
    const initial = Array.from({length: 50_000}, (_, i) => ({timestamp: i * 1000, value: i % 101}));
    window.append(initial, 50_000_000);
    for (let i = 50_000; i < 100_000; i++) {
      window.append([{timestamp: i * 1000, value: i % 101}], i * 1000);
    }
    const snapshot = window.snapshot(99_999_000);
    expect(snapshot.count).toBe(86_401);
    expect(snapshot.timeline[0]).toBe(13_599_000);
    expect(snapshot.timeline.every((time, i) => snapshot.values[i] === (time / 1000) % 101)).toBe(true);
  });

  it('handles duplicates, late samples, missing values and invalid input', () => {
    const window = new CpuWindow();
    window.append([
      {timestamp: 1, value: 10},
      {timestamp: 1, value: 20},
      {timestamp: 0, value: 30},
      {timestamp: 2, value: null},
      {timestamp: 3, value: NaN},
      {timestamp: 4, value: 101},
      {timestamp: 5, value: -1},
      {timestamp: Infinity, value: 50},
      {timestamp: 11, value: 50},
    ], 10);
    expect(window.snapshot(10).timeline).toEqual([1, 2]);
    expect(window.snapshot(10).values).toEqual([20, null]);
  });

  it('does not mutate source data or previous snapshots', () => {
    const window = new CpuWindow();
    const sample = {timestamp: 1, value: 10};
    window.append([sample], 1);
    const previous = window.snapshot(1);
    sample.value = 90;
    window.append([{timestamp: 1, value: 30}, {timestamp: 2, value: 40}], 2);
    expect(previous.values).toEqual([10]);
    expect(window.snapshot(2).values).toEqual([30, 40]);
  });
});
