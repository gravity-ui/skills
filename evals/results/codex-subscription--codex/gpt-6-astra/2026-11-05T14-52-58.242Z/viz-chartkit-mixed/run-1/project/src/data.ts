import type { Point } from "./components/Visualization";
const shape = [
  18, 21, 19, 27, 23, 20, 29, 31, 26, 34, 28, 29, 36, 31, 26, 33, 38, 35, 41,
  32, 37, 33, 45, 49, 42, 47, 40, 46, 43, 53,
];
export function salesData(days: number): Point[] {
  return shape
    .map((value, i) => ({
      time: Date.UTC(2026, 5, i + 1),
      value: value * 1000 + ((i * 137) % 1100),
      previous:
        Math.round(
          (16000 + (i / 30) * 18000 + Math.sin(i * 0.8) * 4500) / 100,
        ) * 100,
    }))
    .slice(-days);
}
export function monitoringData(minutes: number, tick: number): Point[] {
  const count = minutes * 60;
  return Array.from({ length: count }, (_, i) => {
    const n = 3600 - count + i + tick;
    return {
      time: Date.UTC(2026, 5, 30, 14, 0) + tick * 1000 - (count - i) * 1000,
      value: Math.round(
        68 +
          Math.sin(n * 0.043) * 14 +
          Math.sin(n * 1.71) * 19 +
          Math.abs(Math.sin(n * 0.331)) * 19 +
          (n % 137 < 5 ? Math.sin(((n % 137) / 5) * Math.PI) * 145 : 0),
      ),
      previous: Math.round(
        95 + Math.sin(n * 0.03) * 15 + Math.sin(n * 1.1) * 12,
      ),
    };
  });
}
