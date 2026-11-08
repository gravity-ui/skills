export type VisualizationMode = "sales" | "monitoring";
export interface DataPoint {
  x: number;
  y: number;
}
export interface VisualizationSeries {
  id: string;
  name: string;
  data: DataPoint[];
  color: string;
  dashed?: boolean;
}
export const END_DATE = Date.UTC(2026, 9, 30);
const salesShape = [
  58, 68, 61, 76, 64, 48, 53, 95, 103, 86, 112, 107, 87, 96, 125, 117, 150, 134,
  145, 124, 135, 161, 147, 168, 157, 192, 170, 185, 176, 208,
];
export function getSalesData(days: number): VisualizationSeries[] {
  const points = Array.from({ length: days }, (_, i) => {
    const shape = salesShape[i % salesShape.length];
    return {
      x: END_DATE - (days - 1 - i) * 86400000,
      y: Math.round(
        shape * (days === 90 ? 0.7 + i / 150 : days === 7 ? 1.2 : 1),
      ),
    };
  });
  return [
    {
      id: "revenue",
      name: "Текущий период",
      color: "var(--g-color-text-brand)",
      data: points,
    },
    {
      id: "previous",
      name: "Предыдущий период",
      color: "var(--g-color-text-secondary)",
      dashed: true,
      data: points.map((p, i) => ({
        x: p.x,
        y: Math.round(p.y * (0.66 + Math.sin(i * 0.8) * 0.11)),
      })),
    },
  ];
}
export function getMonitoringData(
  minutes: number,
  end: number,
): VisualizationSeries[] {
  end = Math.floor(end / 1000) * 1000;
  const length = minutes * 60;
  const sampleEnd = Math.floor(end / 1000);
  const signal = (index: number) => sampleEnd - length + 1 + index;
  return [
    {
      id: "api",
      name: "API Gateway",
      color: "var(--g-color-text-brand)",
      data: Array.from({ length }, (_, i) => ({
        x: end - (length - 1 - i) * 1000,
        y: Math.round(
          65 +
            13 * Math.sin(signal(i) / 43) +
            17 * Math.abs(Math.sin(signal(i) * 1.76)) +
            (signal(i) % 487 < 12 ? 54 : 0),
        ),
      })),
    },
    {
      id: "worker",
      name: "Worker Service",
      color: "var(--g-color-text-info)",
      data: Array.from({ length }, (_, i) => ({
        x: end - (length - 1 - i) * 1000,
        y: Math.round(
          36 +
            8 * Math.sin(signal(i) / 77) +
            10 * Math.abs(Math.cos(signal(i) * 1.24)),
        ),
      })),
    },
  ];
}
export function exportCsv(
  series: VisualizationSeries[],
  mode: VisualizationMode,
) {
  const rows = [
    "series,timestamp,value",
    ...series.flatMap((s) =>
      s.data.map(
        (p) => `"${s.name.replaceAll('"', '""')}",${new Date(p.x).toISOString()},${p.y}`,
      ),
    ),
  ];
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + rows.join("\n")], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `pulse-${mode}.csv`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
