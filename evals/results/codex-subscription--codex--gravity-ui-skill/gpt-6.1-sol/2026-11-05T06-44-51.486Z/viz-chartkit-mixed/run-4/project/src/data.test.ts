import { describe, expect, it } from "vitest";
import { END_DATE, getMonitoringData, getSalesData } from "./data";

describe("widget data contract", () => {
  it.each([7, 30, 90])(
    "provides %i daily sales points and aligned comparison dates",
    (days) => {
      const [current, previous] = getSalesData(days);
      expect(current.data).toHaveLength(days);
      expect(current.data.at(-1)?.x).toBe(END_DATE);
      expect(current.data.map((p) => p.x)).toEqual(
        previous.data.map((p) => p.x),
      );
      expect(
        current.data.every(
          (p, i) =>
            p.y >= 0 && (i === 0 || p.x - current.data[i - 1].x === 86400000),
        ),
      ).toBe(true);
    },
  );
  it("provides a dense, aligned, one-second monitoring timeline", () => {
    const end = 1_790_000_000_000;
    const series = getMonitoringData(60, end);
    for (const s of series) {
      expect(s.data).toHaveLength(3600);
      expect(s.data.at(-1)?.x).toBe(end);
      expect(
        s.data.every(
          (p, i) =>
            Number.isFinite(p.y) && (i === 0 || p.x - s.data[i - 1].x === 1000),
        ),
      ).toBe(true);
    }
    expect(series[0].data.map((p) => p.x)).toEqual(
      series[1].data.map((p) => p.x),
    );
  });
  it("retains historical values when a live window advances", () => {
    const before = getMonitoringData(15, 1_790_000_000_000);
    const after = getMonitoringData(15, 1_790_000_005_000);
    for (let index = 0; index < before.length; index++) {
      expect(before[index].data.slice(5)).toEqual(
        after[index].data.slice(0, -5),
      );
    }
  });
});
