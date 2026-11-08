import type { ChartData } from "@gravity-ui/charts";
import type { YagrWidgetData } from "@gravity-ui/chartkit/yagr";
import type { VisualizationData } from "./types";

export function salesConfig(
  data: VisualizationData,
  hidden: string[],
): ChartData {
  return {
    chart: { margin: { top: 16, right: 14, bottom: 8, left: 4 } },
    legend: { enabled: false },
    series: {
      data: data.series
        .filter((s) => !hidden.includes(s.id))
        .map((s) => ({
          type: "line",
          name: s.name,
          color: s.comparison
            ? "var(--g-color-text-hint)"
            : "var(--g-color-text-positive)",
          lineWidth: s.comparison ? 2 : 3,
          dashStyle: s.comparison ? "Dash" : "Solid",
          interpolation: { type: "monotone" },
          data: data.timeline.map((x, i) => ({ x, y: s.values[i] })),
        })),
    },
    xAxis: {
      type: "datetime",
      grid: { enabled: false },
      lineVisible: false,
      tickMarks: { enabled: false },
      ticks: { interval: 140 },
      labels: {
        dateTimeLabelFormats: { day: "D MMM", week: "D MMM", month: "MMM" },
      },
    },
    yAxis: [
      {
        min: 0,
        lineVisible: false,
        tickMarks: { enabled: false },
        ticks: { interval: 75 },
        labels: { numberFormat: { multiplier: 0.001, postfix: " тыс." } },
      },
    ],
    tooltip: {
      headerFormat: { type: "date", format: "D MMMM YYYY" },
      valueFormat: {
        type: "number",
        precision: 0,
        showRankDelimiter: true,
        postfix: ` ${data.unit}`,
      },
    },
  };
}

export function monitoringConfig(
  data: VisualizationData,
  hidden: string[],
): YagrWidgetData {
  return {
    data: {
      timeline: data.timeline,
      timeZone: "UTC",
      graphs: data.series
        .filter((s) => !hidden.includes(s.id))
        .map((s) => ({
          id: s.id,
          name: s.name,
          data: s.values,
          type: "line",
          width: s.comparison ? 1 : 1.5,
          color: s.comparison
            ? "var(--g-color-text-hint)"
            : "var(--g-color-text-positive)",
        })),
    },
    libraryConfig: {
      chart: {
        timeMultiplier: 1,
        size: { adaptive: true },
        select: { zoom: true },
      },
      legend: { show: false },
      tooltip: { show: true },
      scales: { y: { min: 0 } },
      axes: { y: { precision: 0 }, x: { grid: { show: false } } },
    },
  };
}
