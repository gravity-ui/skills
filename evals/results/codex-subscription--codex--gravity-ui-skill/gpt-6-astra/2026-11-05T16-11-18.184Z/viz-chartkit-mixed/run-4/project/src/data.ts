export type VisualizationMode = 'sales' | 'monitoring';
export type DataPoint = {x: number; y: number | null};
export type DataSeries = {id: string; name: string; points: DataPoint[]};
export type VisualizationData = {series: DataSeries[]; unit: string};

const DAY = 86_400_000;
export const DEMO_END = Date.UTC(2026, 9, 30);
const sales = [61, 69, 65, 62, 78, 73, 82, 71, 66, 87, 82, 91, 76, 86, 99, 92, 98, 87, 106, 112, 97, 92, 101, 117, 108, 122, 114, 109, 129, 123];
export function createDemoData(mode: VisualizationMode, range: number, tick = 0): VisualizationData {
  const count = mode === 'sales' ? range : 2880;
  const step = mode === 'sales' ? DAY : range * 3_600_000 / (count - 1);
  const end = mode === 'sales' ? DEMO_END : Date.UTC(2026, 9, 30, 18) + tick * 5000;
  const current = Array.from({length: count}, (_, i) => ({
    x: end - (count - 1 - i) * step,
    y: mode === 'sales' ? Math.round((sales[i % 30] + Math.floor(i / 30) * 3) * 1000) : Math.round(38 + 10 * Math.sin(i / 110) + 5 * Math.sin(i * 2.31 + tick) + 8 * Math.abs(Math.sin(i * .37)) + (i % 491 < 13 ? 28 : 0)),
  }));
  return {unit: mode === 'sales' ? '₽' : '%', series: [
    {id: 'current', name: mode === 'sales' ? 'Текущий период' : 'CPU · основной', points: current},
    {id: 'previous', name: mode === 'sales' ? 'Предыдущий период' : 'CPU · резервный', points: current.map((p, i) => ({x: p.x, y: mode === 'sales' ? Math.round(p.y * (.72 + Math.sin(i * .8) * .09)) : Math.round(26 + 8 * Math.sin(i / 130) + 4 * Math.cos(i * 1.71 + tick))}))},
  ]};
}
export function toCsv(data: VisualizationData) {
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return '\uFEFF' + ['Время,Ряд,Значение,Единица', ...data.series.flatMap(s => s.points.map(p => `${new Date(p.x).toISOString()},${escape(s.name)},${p.y ?? ''},${escape(data.unit)}`))].join('\r\n');
}
export const number = (n: number, digits = 0) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: digits}).format(n);
