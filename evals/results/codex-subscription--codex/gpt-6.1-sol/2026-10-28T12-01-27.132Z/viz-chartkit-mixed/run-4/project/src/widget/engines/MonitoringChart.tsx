import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { ChartRendererProps } from "../types";

export default function MonitoringChart({
  series,
  height = 320,
  unit = "мс",
  zoom = 1,
}: ChartRendererProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = container.current;
    if (!el || !series[0]?.points.length) return;
    const count = Math.ceil(series[0].points.length / zoom);
    const data: uPlot.AlignedData = [
      series[0].points.slice(-count).map((p) => p.timestamp / 1000),
      ...series.map((s) => s.points.slice(-count).map((p) => p.value)),
    ];
    const plot = new uPlot(
      {
        width: el.clientWidth,
        height,
        padding: [20, 12, 0, 0],
        legend: { show: false },
        cursor: { drag: { x: true, y: false } },
        series: [
          {},
          ...series.map((s) => ({
            label: s.name,
            stroke: s.color,
            width: 1.2,
            fill: s.dashed ? undefined : s.color + "09",
            dash: s.dashed ? [5, 5] : undefined,
            points: { show: false },
            value: (_u: uPlot, value: number | null) =>
              value == null ? "—" : `${value.toFixed(1)} ${unit}`,
          })),
        ],
        axes: [
          {
            stroke: "#92958e",
            grid: { show: false },
            ticks: { show: false },
            font: "11px Golos Text Variable, sans-serif",
            size: 35,
            values: (_u, ticks) =>
              ticks.map((t) =>
                new Date(t * 1000).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "UTC",
                }),
              ),
          },
          {
            stroke: "#92958e",
            grid: { stroke: "#e9ece5", width: 1, dash: [3, 4] },
            ticks: { show: false },
            font: "11px Golos Text Variable, sans-serif",
            size: 57,
            values: (_u, ticks) => ticks.map((t) => `${t} ${unit}`),
          },
        ],
        hooks: {
          setCursor: [
            (u) => {
              const tip = el.querySelector<HTMLDivElement>(".monitor-tooltip");
              if (!tip) return;
              const idx = u.cursor.idx;
              if (idx == null || u.cursor.left == null || u.cursor.left < 0) {
                tip.style.display = "none";
                return;
              }
              tip.style.display = "block";
              tip.style.left = `${Math.min(u.cursor.left + 70, el.clientWidth - 195)}px`;
              tip.replaceChildren();
              const time = document.createElement("strong");
              time.textContent = new Date(
                Number(data[0][idx]) * 1000,
              ).toLocaleTimeString("ru-RU", { timeZone: "UTC" });
              tip.append(time);
              series.forEach((s, i) => {
                const line = document.createElement("div");
                line.textContent = `${s.name}: ${Number(data[i + 1][idx]).toFixed(1)} ${unit}`;
                line.style.color = s.color;
                tip.append(line);
              });
            },
          ],
        },
      },
      data,
      el,
    );
    const observer = new ResizeObserver(() => {
      if (el.clientWidth) plot.setSize({ width: el.clientWidth, height });
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      plot.destroy();
    };
  }, [series, height, unit, zoom]);
  return (
    <div className="monitor-chart" ref={container} style={{ height }}>
      <div className="monitor-tooltip" />
    </div>
  );
}
