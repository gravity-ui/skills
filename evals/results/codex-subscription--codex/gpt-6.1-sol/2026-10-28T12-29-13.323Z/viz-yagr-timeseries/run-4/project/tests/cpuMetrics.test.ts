import { describe, expect, it } from "vitest";
import { CpuBuffer, DAY_MS } from "../src/cpuMetrics";

describe("CPU history", () => {
  it("keeps chronological samples when the ring wraps and enforces its capacity", () => {
    const buffer = new CpuBuffer(3);
    buffer.append(
      [1, 2, 3, 4, 5].map((timestamp) => ({
        timestamp,
        value: timestamp * 10,
      })),
    );
    expect(buffer.snapshot(5)).toMatchObject({
      timeline: [3, 4, 5],
      values: [30, 40, 50],
      current: 50,
      average: 40,
      maximum: 50,
    });
  });

  it("expires points using wall time, even when the stream has stopped", () => {
    const buffer = new CpuBuffer();
    buffer.append([
      { timestamp: 0, value: 10 },
      { timestamp: 1, value: 20 },
    ]);
    expect(buffer.snapshot(DAY_MS).count).toBe(2);
    expect(buffer.snapshot(DAY_MS + 1).timeline).toEqual([1]);
    expect(buffer.snapshot(DAY_MS + 2)).toMatchObject({
      count: 0,
      current: null,
      average: null,
      maximum: null,
    });
  });

  it("replaces a duplicate timestamp, ignores out-of-order and invalid samples", () => {
    const buffer = new CpuBuffer();
    buffer.append([
      { timestamp: 2, value: 10 },
      { timestamp: 2, value: 20 },
      { timestamp: 1, value: 30 },
      { timestamp: 3, value: 101 },
      { timestamp: NaN, value: 0 },
      { timestamp: 4, value: Infinity },
    ]);
    expect(buffer.snapshot(4)).toMatchObject({ timeline: [2], values: [20] });
  });

  it("preserves missing data without treating it as zero in statistics", () => {
    const buffer = new CpuBuffer();
    buffer.append([
      { timestamp: 1, value: 0 },
      { timestamp: 2, value: 100 },
      { timestamp: 3, value: null },
    ]);
    expect(buffer.snapshot(3)).toMatchObject({
      values: [0, 100, null],
      current: null,
      average: 50,
      maximum: 100,
    });
  });

  it("handles a full day with tens of thousands of points and isolates input mutations", () => {
    const buffer = new CpuBuffer();
    const samples = Array.from({ length: 86_401 }, (_, i) => ({
      timestamp: i * 1000,
      value: i % 101,
    }));
    buffer.append(samples);
    samples[0].value = 100;
    const snapshot = buffer.snapshot(DAY_MS);
    expect(snapshot.count).toBe(86_401);
    expect(snapshot.values[0]).toBe(0);
    expect(snapshot.timeline.at(-1)).toBe(DAY_MS);
    buffer.append([{ timestamp: DAY_MS + 1000, value: 50 }]);
    expect(buffer.snapshot(DAY_MS + 1000).count).toBe(86_401);
  });
});
