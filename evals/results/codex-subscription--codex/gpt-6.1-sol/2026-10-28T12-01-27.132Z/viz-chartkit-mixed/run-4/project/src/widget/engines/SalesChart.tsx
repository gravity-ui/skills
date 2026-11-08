import { useEffect, useRef } from "react";
import Highcharts from "highcharts";
import type { ChartRendererProps } from "../types";

export default function SalesChart({
  series,
  height = 320,
  unit = "₽",
}: ChartRendererProps) {
  const container = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!container.current) return;
    const chart = Highcharts.chart(container.current, {
      chart: {
        type: "spline",
        height,
        backgroundColor: "transparent",
        spacing: [18, 9, 8, 0],
        style: { fontFamily: "Golos Text Variable, sans-serif" },
        animation: false,
      },
      title: { text: undefined },
      credits: { enabled: false },
      legend: { enabled: false },
      xAxis: {
        type: "datetime",
        lineColor: "#e9ebe7",
        tickLength: 0,
        tickInterval: 86400000 * (series[0]?.points.length > 14 ? 4 : 2),
        labels: {
          style: { color: "#92958e", fontSize: "11px" },
          formatter() {
            return new Date(this.value).toLocaleDateString("ru-RU", {
              day: "2-digit",
              month: "short",
              timeZone: "UTC",
            });
          },
        },
        crosshair: { color: "#d9ded3", dashStyle: "Dash" },
      },
      yAxis: {
        title: { text: undefined },
        min: 0,
        tickAmount: 5,
        gridLineColor: "#eef0eb",
        gridLineDashStyle: "Dash",
        labels: {
          style: { color: "#92958e", fontSize: "11px" },
          formatter() {
            return `${Number(this.value) / 1000} тыс.`;
          },
        },
      },
      tooltip: {
        shared: true,
        backgroundColor: "#fff",
        borderColor: "#e6e9e2",
        borderRadius: 10,
        shadow: false,
        padding: 13,
        xDateFormat: "%d.%m.%Y",
        valueSuffix: ` ${unit}`,
        valueDecimals: 0,
      },
      plotOptions: {
        series: {
          animation: false,
          marker: { enabled: false, radius: 4, symbol: "circle" },
          states: { hover: { lineWidthPlus: 0 } },
          lineWidth: 2.5,
        },
      },
      series: series.map((item) => ({
        type: "spline" as const,
        name: item.name,
        color: item.color,
        data: item.points.map((p) => [p.timestamp, p.value]),
        dashStyle: item.dashed ? ("ShortDash" as const) : ("Solid" as const),
        lineWidth: item.dashed ? 2 : 2.8,
      })),
      accessibility: { enabled: false },
    });
    const observer = new ResizeObserver(() => chart.reflow());
    observer.observe(container.current);
    return () => {
      observer.disconnect();
      chart.destroy();
    };
  }, [series, height, unit]);
  return <div ref={container} style={{ height, width: "100%" }} />;
}
