import type {TimeSeries} from './types';

export interface AlignedSeries {
  /** Общая ось времени (мс), отсортированная по возрастанию, без дублей. */
  timeline: number[];
  /** Колонки значений в порядке `series`, длина каждой равна длине timeline. */
  columns: (number | null)[][];
}

/**
 * Yagr требует общий timeline для всех рядов. Объединяем метки времени
 * и заполняем отсутствующие значения `null` (разрыв линии).
 * Быстрый путь: если у всех рядов метки совпадают, ничего не пересчитываем.
 */
export function alignSeries(series: readonly TimeSeries[]): AlignedSeries {
  if (series.length === 0) {
    return {timeline: [], columns: []};
  }

  const first = series[0].points;
  const sameGrid = series.every(
    (s) => s.points.length === first.length && s.points.every((p, i) => p[0] === first[i][0]),
  );
  if (sameGrid) {
    return {
      timeline: first.map((p) => p[0]),
      columns: series.map((s) => s.points.map((p) => p[1])),
    };
  }

  const stamps = new Set<number>();
  for (const s of series) {
    for (const p of s.points) {
      stamps.add(p[0]);
    }
  }
  const timeline = [...stamps].sort((a, b) => a - b);
  const index = new Map(timeline.map((t, i) => [t, i]));

  const columns = series.map((s) => {
    const column: (number | null)[] = new Array(timeline.length).fill(null);
    for (const [t, v] of s.points) {
      column[index.get(t)!] = v;
    }
    return column;
  });
  return {timeline, columns};
}
