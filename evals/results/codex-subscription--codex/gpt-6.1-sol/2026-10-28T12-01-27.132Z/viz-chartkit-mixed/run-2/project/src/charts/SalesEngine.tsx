import ChartKit, { settings } from "@gravity-ui/chartkit";
import { GravityChartsPlugin } from "@gravity-ui/chartkit/gravity-charts";
import type { ChartEngineProps } from "./types";

settings.set({ plugins: [GravityChartsPlugin], lang: "ru" });
export default function SalesEngine({ points, comparison }: ChartEngineProps) {
  return (
    <ChartKit
      type="gravity-charts"
      data={{
        chart: { margin: { top: 15, right: 15, bottom: 5, left: 5 } },
        series: {
          data: [
            ...(comparison
              ? [
                  {
                    type: "line" as const,
                    name: "Предыдущий период",
                    color: "#c5ccd2",
                    dashStyle: "Dash" as const,
                    lineWidth: 2,
                    interpolation: { type: "monotone" as const },
                    data: points.map((p) => ({
                      x: p.timestamp,
                      y: p.previous,
                    })),
                  },
                ]
              : []),
            {
              type: "line",
              name: "Текущий период",
              color: "#269c78",
              lineWidth: 2.5,
              interpolation: { type: "monotone" },
              data: points.map((p) => ({ x: p.timestamp, y: p.value })),
            },
          ],
        },
        xAxis: {
          type: "datetime",
          lineVisible: false,
          grid: { enabled: false },
          ticks: {
            values: points
              .filter(
                (_, i) =>
                  i % Math.max(1, Math.ceil(points.length / 6)) === 0 ||
                  i === points.length - 1,
              )
              .map((point) => point.timestamp),
          },
          labels: {
            dateFormat: points.length === 24 ? "HH:mm" : "DD.MM",
            style: { fontSize: "11px" },
          },
        },
        yAxis: [
          {
            lineVisible: false,
            min: 0,
            max:
              Math.ceil(Math.max(...points.map((p) => p.value)) / 40000) *
              40000,
            ticks: { pixelInterval: 62 },
            labels: {
              numberFormat: {
                precision: 0,
                units: { factor: 1000, postfix: "тыс. ₽" },
              },
              style: { fontSize: "11px" },
            },
          },
        ],
        legend: { enabled: false },
        tooltip: {
          headerFormat: {
            type: "custom",
            formatter: ({ value }) =>
              new Date(Number(value)).toLocaleDateString("ru-RU", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              }),
          },
          valueFormat: {
            type: "number",
            precision: 0,
            postfix: " ₽",
            showRankDelimiter: true,
          },
        },
      }}
    />
  );
}
