import type {ChartSeries} from './types';

export interface AlignedSeries {
  /** Общая временная шкала в мс, отсортированная по возрастанию. */
  timeline: number[];
  /** Значения каждой серии на общей шкале. `null` там, где у серии нет точки. */
  values: Map<string, (number | null)[]>;
}

/**
 * Приводит серии с независимыми `x` к одной шкале.
 * Yagr требует общий массив `timeline` и значения той же длины для каждой серии.
 * Для плотных рядов с одинаковой сеткой времени результат совпадает с исходными точками.
 */
export function alignToTimeline(series: ChartSeries[]): AlignedSeries {
  const xs = new Set<number>();
  for (const s of series) {
    for (const p of s.points) xs.add(p.x);
  }
  const timeline = [...xs].sort((a, b) => a - b);
  const indexOf = new Map(timeline.map((x, i) => [x, i]));

  const values = new Map<string, (number | null)[]>();
  for (const s of series) {
    const column: (number | null)[] = new Array(timeline.length).fill(null);
    for (const p of s.points) {
      column[indexOf.get(p.x)!] = p.y;
    }
    values.set(s.id, column);
  }
  return {timeline, values};
}
