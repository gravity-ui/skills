import { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";
import type { ChartEngineProps } from "../components/VisualizationWidget";
export default function MonitoringEngine({
  data,
  series,
  granularity,
}: ChartEngineProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const step = granularity === "5 с" ? 5 : granularity === "15 с" ? 15 : 1;
    const rows = data.filter((_, i) => i % step === 0);
    const plot = new uPlot(
      {
        width: container.current.clientWidth,
        height: container.current.clientHeight,
        padding: [16, 12, 0, 0],
        cursor: { drag: { x: true, y: false } },
        legend: { show: false },
        scales: { x: { time: true }, y: { range: [0, 400] } },
        axes: [
          {
            stroke: "#9399a8",
            grid: { show: false },
            ticks: { show: false },
            font: "11px Inter, sans-serif",
            values: (_, ticks) =>
              ticks.map((v) =>
                new Date(v * 1000).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              ),
            gap: 14,
          },
          {
            stroke: "#9399a8",
            grid: { stroke: "#edf0f5", width: 1, dash: [4, 4] },
            ticks: { show: false },
            size: 64,
            font: "11px Inter, sans-serif",
            values: (_, ticks) => ticks.map((v) => `${v} мс`),
            gap: 12,
          },
        ],
        series: [
          {},
          {
            label: series[0].name,
            stroke: "#9060e8",
            width: 1.4,
            fill: "rgba(144,96,232,0.055)",
            show: series[0].visible,
            value: (_, v) => `${Math.round(v ?? 0)} мс`,
          },
          {
            label: series[1].name,
            stroke: "#b4becd",
            width: 1,
            show: series[1].visible,
            value: (_, v) => `${Math.round(v ?? 0)} мс`,
          },
        ],
        hooks: {
          setCursor: [
            (u) => {
              const idx = u.cursor.idx;
              const el =
                container.current?.querySelector<HTMLDivElement>(
                  ".monitor-tooltip",
                );
              if (el && idx != null) {
                el.style.display = "block";
                el.textContent = `${new Date(rows[idx].time).toLocaleTimeString("ru-RU")} · ${Math.round(rows[idx].value)} мс`;
                el.style.left = `${Math.min(u.cursor.left ?? 0, u.width - 230) + 60}px`;
              }
            },
          ],
        },
      },
      [
        rows.map((p) => p.time / 1000),
        rows.map((p) => p.value),
        rows.map((p) => p.comparison),
      ],
      container.current,
    );
    const observer = new ResizeObserver(([entry]) =>
      plot.setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      }),
    );
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      plot.destroy();
    };
  }, [data, series[0].visible, series[1].visible, granularity]);
  return (
    <div
      className="monitor-chart"
      ref={container}
      onMouseLeave={(e) => {
        const tip =
          e.currentTarget.querySelector<HTMLDivElement>(".monitor-tooltip");
        if (tip) tip.style.display = "none";
      }}
    >
      <div className="monitor-tooltip" />
    </div>
  );
}
