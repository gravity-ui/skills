import { describe, expect, it } from "vitest";
import { monitoringConfig, salesConfig } from "./chart-config";
import { createDemoData, summarize, toCsv } from "./data";
import type { VisualizationData } from "./types";

const fixture: VisualizationData = {
  unit: "₽",
  timeline: [1000, 2000, 3000],
  series: [
    { id: "a", name: "Выручка", values: [10, null, 30] },
    { id: "b", name: "План", comparison: true, values: [10, 10, 10] },
  ],
};

describe("Unified visualization data", () => {
  it("keeps timestamps, null gaps and values intact for both engines", () => {
    const sales = salesConfig(fixture, []);
    const monitoring = monitoringConfig(fixture, []);
    expect(sales.series.data[0].data).toEqual([
      { x: 1000, y: 10 },
      { x: 2000, y: null },
      { x: 3000, y: 30 },
    ]);
    expect(monitoring.data.timeline).toEqual(fixture.timeline);
    expect(monitoring.data.graphs[0].data).toEqual([10, null, 30]);
    expect(monitoring.libraryConfig.chart?.timeMultiplier).toBe(1);
  });
  it("filters the same series in either engine without changing the input", () => {
    expect(salesConfig(fixture, ["a"]).series.data.map((s) => "name" in s ? s.name : undefined)).toEqual([
      "План",
    ]);
    expect(
      monitoringConfig(fixture, ["a"]).data.graphs.map((s) => s.name),
    ).toEqual(["План"]);
    expect(fixture.series).toHaveLength(2);
  });
  it("can hide every series", () => {
    expect(salesConfig(fixture, ["a", "b"]).series.data).toEqual([]);
    expect(monitoringConfig(fixture, ["a", "b"]).data.graphs).toEqual([]);
  });
  it("calculates totals and averages without treating missing points as zero", () => {
    expect(summarize(fixture)).toMatchObject({ sum: 40, average: 20, max: 30 });
    expect(summarize({ ...fixture, series: [] })).toEqual({
      sum: 0,
      average: 0,
      max: 0,
      growth: 0,
    });
  });
  it.each([1, 6, 24])(
    "generates an aligned dense timeline for %i hours",
    (hours) => {
      const data = createDemoData("monitoring", hours);
      expect(data.timeline.length).toBeGreaterThanOrEqual(3600);
      expect(data.timeline.at(-1)! - data.timeline[0]).toBe(hours * 3_600_000);
      expect(
        data.series.every((s) => s.values.length === data.timeline.length),
      ).toBe(true);
      expect(
        data.timeline.every(
          (time, i) => i === 0 || time > data.timeline[i - 1],
        ),
      ).toBe(true);
    },
  );
  it("exports all plotted points with UTC timestamps and escaped column names", () => {
    const csv = toCsv({
      ...fixture,
      series: [{ id: "a", name: 'Тест "А"', values: [10, null, 30] }],
    });
    expect(csv).toContain('"Тест ""А"" (₽)"');
    expect(csv.split("\r\n")).toHaveLength(4);
    expect(csv).toContain('"1970-01-01T00:00:02.000Z";""');
  });
});
