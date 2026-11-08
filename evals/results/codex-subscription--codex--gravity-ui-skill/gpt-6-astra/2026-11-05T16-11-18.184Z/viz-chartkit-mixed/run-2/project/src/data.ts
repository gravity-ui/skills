export type ViewMode = 'sales' | 'monitoring';
export interface DataPoint {timestamp: number; value: number}
export interface MetricSeries {id: string; name: string; points: DataPoint[]; comparison?: boolean}
export interface VisualizationData {series: MetricSeries[]; unit: string}

const DAY = 86_400_000;
export const salesEnd = Date.UTC(2026, 10, 5);
export function createSalesData(days: number): VisualizationData {
  const points = Array.from({length: days}, (_, i) => {
    const day = 90 - days + i;
    return {timestamp: salesEnd - (days - 1 - i) * DAY,
      value: Math.round((49_000 + day * 650 + Math.sin(day * 0.79) * 14_000 + Math.cos(day * 1.8) * 6_000) / 10) * 10};
  });
  return {unit: '₽', series: [
    {id: 'revenue', name: 'Текущий период', points},
    {id: 'previous', name: 'Предыдущий период', comparison: true,
      points: points.map((p, i) => ({timestamp: p.timestamp, value: Math.round(p.value / (1.22 + Math.sin(i * 0.65) * 0.12) / 10) * 10}))},
  ]};
}
export function createMonitoringData(hours: number, end: number): VisualizationData {
  const count = hours * 360;
  const alignedEnd = Math.floor(end / 10_000) * 10_000;
  const points = Array.from({length: count}, (_, i) => {
    const timestamp = alignedEnd - (count - 1 - i) * 10_000;
    const t = timestamp / 10_000;
    const noise = Math.abs(Math.sin(t * 12.9898) * 43758.5453) % 1;
    return {timestamp, value: Math.round((37 + 8 * Math.sin(t / 90) + 5 * Math.cos(t / 24) + noise * 16 + (Math.sin(t / 120) > 0.98 ? 18 : 0)) * 10) / 10};
  });
  return {unit: '%', series: [{id: 'cpu', name: 'Загрузка CPU', points}]};
}
export function summarize(data: VisualizationData) {
  const values = data.series[0]?.points.map((p) => p.value) ?? [];
  const total = values.reduce((a, b) => a + b, 0);
  const previous = data.series[1]?.points.reduce((sum, p) => sum + p.value, 0) ?? 0;
  return {total, average: values.length ? total / values.length : 0,
    max: values.length ? Math.max(...values) : 0,
    last: values.at(-1) ?? 0, count: values.length,
    growth: previous ? (total / previous - 1) * 100 : 0};
}
export function toCsv(data: VisualizationData): string {
  const cell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;
  return '\uFEFFВремя UTC;Ряд;Значение;Единица\n' + data.series.flatMap((series) =>
    series.points.map((p) => [new Date(p.timestamp).toISOString(), series.name, p.value, data.unit].map(cell).join(';')),
  ).join('\n');
}
