import { describe, expect, it } from "vitest";
import {
  appendCpuSample,
  createDemoHistory,
  DAY,
  getCpuStats,
  lowerBound,
  SAMPLE_INTERVAL,
} from "./cpu-data";

describe("CPU history", () => {
  it("provides a complete day of 43,201 aligned, sorted samples", () => {
    const history = createDemoHistory(Date.UTC(2026, 9, 28, 12));
    expect(history.timestamps).toHaveLength(43_201);
    expect(history.values).toHaveLength(history.timestamps.length);
    expect(history.timestamps.at(-1)! - history.timestamps[0]).toBe(DAY);
    expect(
      history.timestamps.every(
        (t, i, list) => i === 0 || t - list[i - 1] === SAMPLE_INTERVAL,
      ),
    ).toBe(true);
    expect(
      history.values.every(
        (value) => value >= 0 && value <= 100 && Number.isFinite(value),
      ),
    ).toBe(true);
  });

  it("retains a rolling day without mutating snapshots", () => {
    const original = createDemoHistory(DAY * 2);
    const next = appendCpuSample(original, DAY * 2 + SAMPLE_INTERVAL, 42);
    expect(next.timestamps).toHaveLength(43_201);
    expect(next.timestamps[0]).toBe(DAY + SAMPLE_INTERVAL);
    expect(next.values.at(-1)).toBe(42);
    expect(original.timestamps[0]).toBe(DAY);
    expect(original.timestamps.at(-1)).toBe(DAY * 2);
  });

  it("discards expired history after a suspended tab resumes", () => {
    const original = createDemoHistory(DAY * 2);
    expect(appendCpuSample(original, DAY * 4, 50)).toEqual({
      timestamps: [DAY * 4],
      values: [50],
    });
  });

  it("ignores invalid, duplicate, and out-of-order stream samples", () => {
    const history = { timestamps: [100], values: [30] };
    for (const [timestamp, value] of [
      [100, 40],
      [99, 40],
      [101, NaN],
      [Infinity, 40],
      [101, -1],
      [101, 101],
    ]) {
      expect(appendCpuSample(history, timestamp, value)).toBe(history);
    }
    expect(appendCpuSample(history, 101, 0).values).toEqual([30, 0]);
    expect(appendCpuSample(history, 101, 100).values).toEqual([30, 100]);
  });

  it("computes statistics for the selected time range including its boundary", () => {
    const history = {
      timestamps: [0, 3_600_000, 7_200_000],
      values: [100, 20, 40],
    };
    expect(getCpuStats(history, 1)).toEqual({
      current: 40,
      average: 30,
      peak: 40,
      count: 2,
    });
    expect(getCpuStats(history, 24).peak).toBe(100);
    expect(getCpuStats({ timestamps: [], values: [] }, 24)).toEqual({
      current: null,
      average: null,
      peak: null,
      count: 0,
    });
  });

  it("finds the first timestamp in the visible range", () => {
    expect(lowerBound([], 3)).toBe(0);
    expect(lowerBound([1, 3, 5], 3)).toBe(1);
    expect(lowerBound([1, 3, 5], 4)).toBe(2);
    expect(lowerBound([1, 3, 5], 6)).toBe(3);
  });
});
