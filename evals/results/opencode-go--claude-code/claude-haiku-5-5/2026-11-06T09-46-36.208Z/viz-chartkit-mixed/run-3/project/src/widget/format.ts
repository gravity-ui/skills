import type {ChartPoint} from './types';

const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export function formatValue(value: number, unit?: string): string {
  const formatted = numberFormat.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

/** Значение точки с максимальным `x`, у которой есть `y`. Порядок точек не важен. */
export function lastValue(points: ChartPoint[]): number | null {
  let latest: ChartPoint | undefined;
  for (const point of points) {
    if (point.y !== null && (latest === undefined || point.x > latest.x)) {
      latest = point;
    }
  }
  return latest ? latest.y : null;
}
