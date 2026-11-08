export type Mode = 'sales' | 'monitoring';
export type Metric = 'revenue' | 'orders' | 'average';
export type Point = {timestamp: number; value: number};
export type DataSeries = {name: string; points: Point[]};
const DAY = 86_400_000;
export const END = Date.UTC(2026, 9, 30);
const pattern = [54, 65, 59, 78, 74, 69, 85, 82, 71, 63, 79, 94, 87, 91, 107, 98, 88, 111, 103, 96, 116, 124, 112, 103, 117, 139, 128, 115, 130, 144];

export function salesData(days: number, metric: Metric, weekly = false): DataSeries[] {
  const series = [false, true].map(previous => {
    const points = Array.from({length: days}, (_, i) => {
      const p = pattern[(i + 30 - days % 30) % 30];
      const revenue = Math.round(p * 1000 * (previous ? 0.79 + Math.sin(i * 1.3) * 0.075 : 1) * (days > 30 ? 0.65 + i / days * 0.35 : 1));
      const orders = Math.round(revenue / (2150 + Math.sin(i * 0.8) * 220));
      return {timestamp: END - (days - 1 - i) * DAY, value: metric === 'revenue' ? revenue : metric === 'orders' ? orders : Math.round(revenue / orders)};
    });
    return {name: previous ? 'Предыдущий период' : 'Текущий период', points};
  });
  if (!weekly) return series;
  if (metric === 'average') {
    const revenue = salesData(days, 'revenue', true);
    const orders = salesData(days, 'orders', true);
    return revenue.map((s, index) => ({...s, points: s.points.map((p, i) => ({...p, value: Math.round(p.value / orders[index].points[i].value)}))}));
  }
  return series.map(s => ({...s, points: s.points.reduce<Point[]>((acc, _, i, all) => {
    if (i % 7 === 0) {
      const group = all.slice(i, i + 7);
      const total = group.reduce((sum, p) => sum + p.value, 0);
      acc.push({timestamp: group[0].timestamp, value: total});
    }
    return acc;
  }, [])}));
}

export function monitoringData(hours: number, end: number): DataSeries[] {
  const count = hours * 360;
  const points = Array.from({length: count}, (_, i) => {
    const timestamp = end - (count - 1 - i) * 10_000;
    const t = timestamp / 10_000;
    const noise = Math.sin(t * 12.9898) * 43758.5453;
    const spike = Math.pow(Math.max(0, Math.sin(t / 54)), 24) * 95;
    return {timestamp, value: Math.round(152 + 23 * Math.sin(t / 210) + (noise - Math.floor(noise)) * 58 + spike)};
  });
  return [{name: 'Время ответа', points}, {name: 'Базовый уровень', points: points.map(p => ({...p, value: 165 + Math.round(12 * Math.sin(p.timestamp / 2_100_000))}))}];
}

export const number = (value: number, digits = 0) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: digits}).format(value);
export const date = (value: number) => new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'}).format(value).replace('.', '');
export const sum = (points: Point[]) => points.reduce((total, p) => total + p.value, 0);

export function exportCsv(series: DataSeries[], mode: Mode, unit: string) {
  const rows = ['Время;' + series.map(s => `${s.name} (${unit})`).join(';'), ...series[0].points.map((p, i) => [new Date(p.timestamp).toISOString(), ...series.map(s => s.points[i]?.value ?? '')].join(';'))];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\r\n')], {type: 'text/csv;charset=utf-8;'}));
  const a = document.createElement('a');
  a.href = url;
  a.download = `pulse-${mode}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
