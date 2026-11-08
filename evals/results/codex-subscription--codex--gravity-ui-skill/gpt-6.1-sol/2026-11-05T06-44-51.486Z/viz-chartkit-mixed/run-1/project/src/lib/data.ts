import type { VisualizationData, WidgetMode } from "./types";

const END = Date.UTC(2026, 10, 5, 12);
const DAY = 86_400_000;
const salesPattern = [
  46, 51, 48, 62, 58, 53, 67, 71, 65, 59, 73, 81, 76, 69, 84, 79, 88, 75, 82,
  94, 89, 98, 91, 104, 96, 102, 113, 105, 118, 124,
];

/** Deterministic sample data; replace with the same shape returned by your API. */
export function createDemoData(
  mode: WidgetMode,
  range: number,
): VisualizationData {
  if (mode === "sales") {
    const timeline = Array.from(
      { length: range },
      (_, i) => END - (range - 1 - i) * DAY,
    );
    const current = timeline.map((_, i) =>
      Math.round(
        (salesPattern[Math.floor((i / range) * 30)] + Math.sin(i * 1.7) * 3) *
          1000,
      ),
    );
    return {
      unit: "₽",
      timeline,
      series: [
        { id: "current", name: "Текущий период", values: current },
        {
          id: "previous",
          name: "Предыдущий период",
          comparison: true,
          values: current.map((v, i) =>
            Math.round(v / 1.186 + Math.sin(i * 0.8) * 7000),
          ),
        },
      ],
    };
  }
  const count = range === 1 ? 3600 : range === 6 ? 7200 : 14400;
  const step = (range * 3_600_000) / (count - 1);
  const timeline = Array.from(
    { length: count },
    (_, i) => END - range * 3_600_000 + i * step,
  );
  const current = timeline.map((_, i) =>
    Math.round(
      43 +
        10 * Math.sin(i / 370) +
        5 * Math.sin(i / 39) +
        4 * Math.sin(i * 2.3) +
        (i % 997 < 9 ? 60 * Math.sin(((i % 997) / 9) * Math.PI) : 0),
    ),
  );
  return {
    unit: "мс",
    timeline,
    series: [
      { id: "current", name: "API · время ответа", values: current },
      {
        id: "previous",
        name: "Базовый уровень",
        comparison: true,
        values: timeline.map((_, i) =>
          Math.round(33 + 5 * Math.sin(i / 500) + 2 * Math.sin(i / 19)),
        ),
      },
    ],
  };
}

export function summarize(data: VisualizationData) {
  const values =
    data.series
      .find((s) => !s.comparison)
      ?.values.filter((v): v is number => v !== null) ?? [];
  const previous =
    data.series
      .find((s) => s.comparison)
      ?.values.filter((v): v is number => v !== null) ?? [];
  const sum = values.reduce((a, b) => a + b, 0);
  const previousSum = previous.reduce((a, b) => a + b, 0);
  return {
    sum,
    average: values.length ? sum / values.length : 0,
    max: values.reduce((max, value) => Math.max(max, value), 0),
    growth: previousSum ? (sum / previousSum - 1) * 100 : 0,
  };
}

export function toCsv(data: VisualizationData): string {
  const escape = (value: string | number | null) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;
  return (
    "\uFEFF" +
    [
      ["Время (UTC)", ...data.series.map((s) => `${s.name} (${data.unit})`)]
        .map(escape)
        .join(";"),
      ...data.timeline.map((time, i) =>
        [
          new Date(time).toISOString(),
          ...data.series.map((s) => s.values[i] ?? null),
        ]
          .map(escape)
          .join(";"),
      ),
    ].join("\r\n")
  );
}
