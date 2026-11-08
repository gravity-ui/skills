import type {TimePoint, VisualizationMode, VisualizationSeries} from './components/VisualizationWidget';

export const SALES_END = Date.UTC(2026, 9, 30);
const daily = [112, 138, 126, 150, 133, 120, 102, 158, 146, 164, 151, 184, 170, 142, 134, 174, 158, 192, 180, 211, 189, 163, 178, 208, 195, 231, 214, 198, 239, 255];
export const money = (n: number) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0}).format(n) + ' ₽';
export const number = (n: number) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0}).format(n);
export function getSeries(mode: VisualizationMode, period: number, tick = 0): VisualizationSeries[] {
  if (mode === 'sales') {
    const values = daily.slice(-period);
    const points: TimePoint[] = values.map((value, i) => ({timestamp: SALES_END - (values.length - i - 1) * 86400000, value: value * 1000}));
    return [
      {id: 'revenue', name: 'Текущий период', color: 'var(--g-color-text-positive)', points},
      {id: 'previous', name: 'Предыдущий период', color: 'var(--g-color-text-hint)', comparison: true,
        points: points.map((p, i) => ({timestamp: p.timestamp, value: Math.round(p.value / 1.184 + Math.sin(i * 1.8) * 16000)}))},
    ];
  }
  const count = period * 120;
  const end = Date.UTC(2026, 9, 30, 15, 30) + tick * 5000;
  return ['API-сервер', 'Обработка заказов'].map((name, s) => ({
    id: `server-${s}`, name,
    color: s === 0 ? 'var(--g-color-text-positive)' : 'var(--g-color-text-info)',
    points: Array.from({length: count}, (_, i) => {
      const t = i + tick * 10;
      return {timestamp: end - (count - i - 1) * 500,
        value: Math.round((s ? 27 : 40) + Math.sin(t * .025) * 8 + Math.sin(t * .31) * 5 + Math.sin(t * 1.97) * 5 + ((t % 379 > 370) ? 24 : 0))};
    }),
  }));
}
export const sum = (points: TimePoint[]) => points.reduce((a, p) => a + p.value, 0);
