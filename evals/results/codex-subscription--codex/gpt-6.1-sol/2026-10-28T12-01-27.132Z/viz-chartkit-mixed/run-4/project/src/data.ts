import type { ChartSeries } from "./widget/types";

export const salesValues = [
  42, 48, 45, 58, 52, 47, 61, 72, 65, 68, 54, 51, 63, 69, 65, 78, 86, 74, 68,
  83, 92, 79, 75, 88, 80, 101, 93, 85, 99, 108,
];
export function getSalesData(days: number, channel: string): ChartSeries[] {
  const factor =
    channel === "Онлайн-магазин" ? 0.68 : channel === "Маркетплейсы" ? 0.32 : 1;
  const values = salesValues.slice(-days);
  return [
    {
      id: "revenue",
      name: "Текущий период",
      color: "#789c47",
      points: values.map((v, i) => ({
        timestamp: Date.UTC(2026, 9, 31 - days + i),
        value: v * 1000 * factor,
      })),
    },
    {
      id: "previous",
      name: "Предыдущий период",
      color: "#c2c8b6",
      dashed: true,
      points: values.map((v, i) => ({
        timestamp: Date.UTC(2026, 9, 31 - days + i),
        value: Math.round(
          (v * 0.71 + Math.sin(i * 1.4) * 11 + 8) * 1000 * factor,
        ),
      })),
    },
  ];
}
export function getMonitoringData(
  minutes: number,
  revision: number,
): ChartSeries[] {
  const n = minutes * 60;
  const end = Date.UTC(2026, 9, 30, 18, 0, revision * 5);
  return [
    {
      id: "latency",
      name: "Время ответа",
      color: "#789c47",
      points: Array.from({ length: n }, (_, i) => {
        const t = i + (60 - minutes) * 60 + revision * 5;
        return {
          timestamp: end - (n - i - 1) * 1000,
          value:
            Math.round(
              (42 +
                5 * Math.sin(t * 0.031) +
                8 * Math.sin(t * 1.71) ** 8 +
                17 * Math.sin(t * 0.077) ** 30 +
                (t % 419 < 5 ? 45 : 0)) *
                10,
            ) / 10,
        };
      }),
    },
    {
      id: "baseline",
      name: "Базовый уровень",
      color: "#c2c8b6",
      dashed: true,
      points: Array.from({ length: n }, (_, i) => ({
        timestamp: end - (n - i - 1) * 1000,
        value:
          38 +
          Math.round(
            Math.sin((i + (60 - minutes) * 60 + revision * 5) * 0.012) * 25,
          ) /
            10,
      })),
    },
  ];
}
export const channels = [
  {
    name: "Онлайн-магазин",
    description: "Прямые продажи на сайте",
    color: "#809c59",
    revenue: 1536000,
    orders: 412,
    share: 68,
    change: "+21,6%",
  },
  {
    name: "Маркетплейсы",
    description: "Ozon, Wildberries и Яндекс Маркет",
    color: "#b3bb9b",
    revenue: 724000,
    orders: 202,
    share: 32,
    change: "+11,3%",
  },
];
