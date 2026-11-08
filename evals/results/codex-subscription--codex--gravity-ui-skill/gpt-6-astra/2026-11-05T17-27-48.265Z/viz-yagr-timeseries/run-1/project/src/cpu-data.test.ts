import {describe, expect, it} from 'vitest';
import {CpuBuffer, DAY_MS} from './cpu-data';

describe('CpuBuffer', () => {
  it('retains the last day and expires data even when the stream is silent', () => {
    const buffer = new CpuBuffer();
    buffer.append([
      {timestamp: 0, value: 10},
      {timestamp: 1, value: 20},
      {timestamp: DAY_MS, value: 30},
    ], DAY_MS);
    expect(buffer.snapshot().timeline).toEqual([0, 1, DAY_MS]);
    expect(buffer.prune(DAY_MS + 1)).toBe(true);
    expect(buffer.snapshot().timeline).toEqual([1, DAY_MS]);
    buffer.prune(2 * DAY_MS + 1);
    expect(buffer.snapshot()).toEqual({timeline: [], data: []});
  });

  it('keeps aligned data after repeated ring wraps and updates duplicate timestamps', () => {
    const buffer = new CpuBuffer(3);
    buffer.append(Array.from({length: 10}, (_, timestamp) => ({timestamp, value: timestamp})), 10);
    buffer.append([{timestamp: 9, value: 90}, {timestamp: 10, value: null}], 10);
    expect(buffer.snapshot()).toEqual({timeline: [8, 9, 10], data: [8, 90, null]});
  });

  it('rejects stale, future, out-of-order and invalid samples without corrupting the series', () => {
    const buffer = new CpuBuffer();
    buffer.append([{timestamp: DAY_MS, value: 50}], DAY_MS);
    buffer.append([
      {timestamp: -1, value: 10},
      {timestamp: 2 * DAY_MS, value: 10},
      {timestamp: DAY_MS - 1, value: 10},
      {timestamp: NaN, value: 10},
      {timestamp: DAY_MS, value: Infinity},
      {timestamp: DAY_MS, value: -1},
      {timestamp: DAY_MS, value: 101},
    ], DAY_MS);
    expect(buffer.snapshot()).toEqual({timeline: [DAY_MS], data: [50]});
  });

  it('handles a full day with tens of thousands of samples and bounds memory', () => {
    const buffer = new CpuBuffer(50_000);
    const samples = Array.from({length: 86_401}, (_, i) => ({timestamp: i * 1000, value: i % 101}));
    buffer.append(samples, DAY_MS);
    const snapshot = buffer.snapshot();
    expect(snapshot.timeline).toHaveLength(50_000);
    expect(snapshot.timeline[0]).toBe(36_401_000);
    expect(snapshot.timeline.at(-1)).toBe(DAY_MS);
    expect(snapshot.data.at(-1)).toBe(86_400 % 101);
  });
});
