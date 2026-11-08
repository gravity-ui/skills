export type ChartMode = "sales" | "monitoring";
export type Period = "day" | "week" | "month" | "year";
export interface ChartPoint {
  timestamp: number;
  value: number;
  previous: number;
}
export interface ChartEngineProps {
  points: ChartPoint[];
  comparison: boolean;
}
export const periodLabels: Record<Period, string> = {
  day: "День",
  week: "Неделя",
  month: "Месяц",
  year: "Год",
};
export const money = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value) +
  " ₽";
export function createPoints(
  mode: ChartMode,
  period: Period,
  end: number,
  multiplier = 1,
): ChartPoint[] {
  const duration = {
    day: 86400000,
    week: 7 * 86400000,
    month: 30 * 86400000,
    year: 365 * 86400000,
  }[period];
  const count =
    mode === "monitoring"
      ? 2400
      : period === "day"
        ? 24
        : period === "year"
          ? 52
          : period === "week"
            ? 7
            : 30;
  const shape = [
    44, 49, 46, 58, 52, 40, 46, 64, 61, 62, 50, 56, 75, 79, 70, 88, 82, 79, 84,
    71, 77, 96, 93, 110, 98, 108, 94, 102, 119, 112,
  ];
  const phase = mode === "monitoring" ? Math.floor(end / 4000) % 1000 : 0;
  const points = Array.from({ length: count }, (_, i) => {
    const t = i / (count - 1);
    const value =
      mode === "sales"
        ? shape[Math.round(t * 29)] * 1000 * multiplier
        : (186 +
            22 * Math.sin((i + phase) * 0.021) +
            12 * Math.sin((i + phase) * 0.19) +
            8 * Math.sin((i + phase) * 1.73) +
            ((i + phase) % 331 < 6 ? 65 : 0)) *
          multiplier;
    return {
      timestamp: Math.round(end - duration + 60000 + t * (duration - 60000)),
      value: Math.round(value),
      previous: Math.round(value * (0.77 + 0.12 * Math.sin(i * 0.7 + 2))),
    };
  });
  if (mode === "sales") {
    const total = points.reduce((sum, point) => sum + point.value, 0);
    const previous = points.reduce((sum, point) => sum + point.previous, 0);
    for (const point of points)
      point.previous = Math.round(
        (point.previous * total) / (previous * 1.186),
      );
  }
  return points;
}
