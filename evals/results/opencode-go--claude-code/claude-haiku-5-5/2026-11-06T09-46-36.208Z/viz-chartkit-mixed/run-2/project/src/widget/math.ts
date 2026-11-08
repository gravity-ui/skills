import type {Series} from './types';

/** Делит серии на показываемые (по числу цветов палитры) и скрытые. */
export function capSeries(series: readonly Series[], max: number) {
  return {shown: series.slice(0, max), hidden: series.slice(max)};
}

/**
 * Выравнивает серии по общей временной оси. `columns[i][k]` — значение серии `i`
 * в момент `times[k]`, либо `null`, если в этот момент точки нет.
 */
export function alignSeries(series: readonly Series[]): {times: number[]; columns: (number | null)[][]} {
  const all = new Set<number>();
  for (const s of series) {
    for (const p of s.points) all.add(p.t);
  }
  const times = [...all].sort((a, b) => a - b);
  const position = new Map<number, number>();
  times.forEach((t, k) => position.set(t, k));

  const columns = series.map((s) => {
    const column: (number | null)[] = new Array<number | null>(times.length).fill(null);
    for (const p of s.points) {
      const k = position.get(p.t);
      if (k !== undefined) column[k] = p.v;
    }
    return column;
  });
  return {times, columns};
}

/** Ближайший индекс к `t` в отсортированном массиве; -1, если массив пуст. */
export function nearestIndex(sorted: readonly number[], t: number): number {
  if (sorted.length === 0) return -1;
  let lo = 0;
  let hi = sorted.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(sorted[lo - 1] - t) <= Math.abs(sorted[lo] - t)) return lo - 1;
  return lo;
}

/** «Круглая» шкала: границы кратны шагу, внутри — ровные тики. */
export function niceScale(min: number, max: number, count: number) {
  let lo = min;
  let hi = max;
  if (hi === lo) hi = lo + 1;
  const raw = (hi - lo) / count;
  const magnitude = 10 ** Math.floor(Math.log10(raw));
  const normalized = raw / magnitude;
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;

  const first = Math.floor(lo / step);
  const last = Math.ceil(hi / step);
  const ticks: number[] = [];
  for (let k = first; k <= last; k++) ticks.push(k * step);
  return {lo: first * step, hi: last * step, ticks};
}
