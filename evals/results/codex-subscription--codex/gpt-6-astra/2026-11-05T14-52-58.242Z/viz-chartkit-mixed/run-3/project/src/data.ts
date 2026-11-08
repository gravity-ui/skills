import type { ChartPoint } from './components/ChartWidget';
const values = [43, 49, 45, 60, 56, 49, 65, 72, 67, 60, 78, 86, 80, 68, 74, 92, 85, 98, 92, 78, 84, 102, 96, 109, 100, 113, 104, 122, 112, 128];
export const salesData: ChartPoint[] = values.map((v, i) => ({ timestamp: Date.UTC(2026, 3, i + 1), value: v * 1000, previous: Math.round((v * .72 + Math.sin(i * .9) * 11 + 6) * 1000) }));
export function monitoringData(hours: number, offset = 0): ChartPoint[] {
  const count = hours * 60;
  return Array.from({ length: count }, (_, i) => {
    const x = i + offset;
    return { timestamp: Date.UTC(2026, 3, 30, 12) - (count - i) * 60000 + offset * 60000, value: Math.round(125 + Math.sin(x * .025) * 22 + Math.sin(x * 2.4) * 18 + Math.cos(x * .61) * 14 + (x % 137 < 4 ? 95 : 0)), previous: Math.round(150 + Math.sin(x * .027) * 17 + Math.cos(x * 1.7) * 13) };
  });
}
export const money = (value: number) => Math.round(value).toLocaleString('ru-RU');
