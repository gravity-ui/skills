export type VisualizationMode = 'sales' | 'monitoring';
export interface DataPoint {x: number; y: number}
export interface DataSeries {id: string; name: string; points: DataPoint[]; secondary?: boolean}
export const number = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});
export const money = (value: number) => `${number.format(value)} ₽`;
const DAY = 86_400_000;
const salesShape = [44, 49, 47, 58, 53, 42, 46, 62, 69, 65, 58, 72, 79, 75, 63, 66, 81, 87, 82, 76, 89, 96, 88, 83, 94, 102, 95, 108, 99, 116];
export function createSales(days: number): DataSeries[] {
  const end = Date.UTC(2026, 10, 4);
  return [false, true].map((secondary) => ({
    id: secondary ? 'previous' : 'current',
    name: secondary ? 'Предыдущий период' : 'Текущий период', secondary,
    points: Array.from({length: days}, (_, i) => {
      const day = 90 - days + i;
      return {
        x: end - (days - 1 - i) * DAY,
        y: Math.round((salesShape[day % 30] * 1000 + Math.sin(day * 2.1) * 2500) * (secondary ? 0.79 + Math.sin(day * 0.65) * 0.1 : 1)),
      };
    }),
  }));
}
export function createMonitoring(minutes: number, end: number): DataSeries[] {
  const count = minutes * 60;
  return [false, true].map((secondary) => ({
    id: secondary ? 'p50' : 'p95', name: secondary ? 'Медиана · p50' : 'Время ответа · p95', secondary,
    points: Array.from({length: count}, (_, i) => {
      const x = end - (count - 1 - i) * 1000;
      const t = x / 1000;
      const wave = Math.sin(t * 0.016) * 18 + Math.sin(t * 0.21) * 8 + Math.sin(t * 1.71) * 12;
      const spike = Math.pow(Math.max(0, Math.sin(t * 0.041)), 22) * 90;
      return {x, y: Math.round(secondary ? 60 + wave * 0.4 : 140 + wave + spike)};
    }),
  }));
}
export function exportCsv(series: DataSeries[], mode: VisualizationMode) {
  const rows = [['timestamp', ...series.map((s) => s.name)], ...series[0].points.map((point, i) => [new Date(point.x).toISOString(), ...series.map((s) => s.points[i]?.y ?? '')])];
  const blob = new Blob(['\uFEFF' + rows.map((row) => row.join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8'});
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = `${mode}-data.csv`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
