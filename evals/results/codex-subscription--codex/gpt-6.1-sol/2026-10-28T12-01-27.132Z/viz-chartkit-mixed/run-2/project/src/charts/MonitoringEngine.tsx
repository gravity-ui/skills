import ChartKit, { settings } from "@gravity-ui/chartkit";
import { YagrPlugin } from "@gravity-ui/chartkit/yagr";
import type { ChartEngineProps } from "./types";

settings.set({ plugins: [YagrPlugin], lang: "ru" });
export default function MonitoringEngine({
  points,
  comparison,
}: ChartEngineProps) {
  return (
    <ChartKit
      type="yagr"
      data={{
        data: {
          timeline: points.map((p) => p.timestamp),
          graphs: [
            {
              id: "response",
              name: "Время ответа",
              color: "#269c78",
              type: "line",
              data: points.map((p) => p.value),
            },
            ...(comparison
              ? [
                  {
                    id: "previous",
                    name: "Предыдущий период",
                    color: "#bcc5ce",
                    type: "line" as const,
                    data: points.map((p) => p.previous),
                  },
                ]
              : []),
          ],
          timeZone: "UTC",
        },
        libraryConfig: {
          chart: {
            series: { type: "line", width: 1.2 },
            timeMultiplier: 1,
            appearance: { theme: "light" },
          },
          legend: { show: false },
          tooltip: { show: true },
          axes: {
            y: {
              stroke: "#8a929e",
              grid: { stroke: "#edf0f2", width: 1 },
              values: (_u, values) => values.map((v) => `${v} мс`),
            },
            x: { stroke: "#8a929e", grid: { show: false } },
          },
        },
      }}
    />
  );
}
