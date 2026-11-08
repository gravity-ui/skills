export type ChartMode = 'sales' | 'monitoring';
export interface WidgetDataset {timeline: number[]; current: number[]; previous: number[];}
export const formatNumber = (value: number, decimals = 0) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: decimals}).format(value);
const endDate = Date.UTC(2026, 8, 30, 12);
const salesShape = [54, 68, 63, 59, 75, 72, 67, 86, 94, 89, 79, 98, 103, 95, 91, 112, 119, 104, 99, 116, 128, 118, 111, 135, 142, 128, 123, 146, 157, 151];
export function createDataset(mode: ChartMode, period: number, tick = 0): WidgetDataset {
  const count = mode === 'sales' ? period : period * 600;
  const step = mode === 'sales' ? 86400000 : 6000;
  const end = mode === 'sales' ? endDate : endDate + tick * step;
  const timeline = Array.from({length: count}, (_, index) => end - (count - index - 1) * step);
  const current = timeline.map((_, index) => mode === 'sales'
    ? Math.round((salesShape[(90 - count + index) % 30] + (Math.floor((90 - count + index) / 30) - 2) * 9) * 950)
    : Math.round(112 + Math.sin((index + tick) / 61) * 17 + Math.sin((index + tick) * 2.3) * 13 + Math.cos((index + tick) / 9) * 7 + ((index + tick) % 349 < 5 ? 95 : 0)));
  const previous = current.map((value, index) => mode === 'sales' ? Math.round(value / (1.124 + Math.sin((90 - count + index) * 1.2) * 0.085)) : Math.round(126 + Math.sin((index + tick) / 82) * 19 + Math.sin((index + tick) * 1.6) * 10));
  return {timeline, current, previous};
}
export function getSummary(data: WidgetDataset) {
  const total = data.current.reduce((sum, value) => sum + value, 0);
  const previousTotal = data.previous.reduce((sum, value) => sum + value, 0);
  return {total, previousTotal, average: Math.round(total / data.current.length), max: Math.max(...data.current), change: (total / previousTotal - 1) * 100};
}
