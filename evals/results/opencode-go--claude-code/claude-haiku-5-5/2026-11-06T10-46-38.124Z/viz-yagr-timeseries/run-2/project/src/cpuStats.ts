export const HOUR_MS = 60 * 60 * 1000;

export interface CpuSummary {
  /** Последний замер. */
  current: number;
  /** Среднее по всему окну. */
  average: number;
  /** Максимум по всему окну. */
  peak: number;
}

/** Сводка по окну. Возвращает null для пустого окна. */
export function summarize(values: readonly number[]): CpuSummary | null {
  const n = values.length;
  if (n === 0) {
    return null;
  }
  let sum = 0;
  let peak = -Infinity;
  for (const v of values) {
    sum += v;
    if (v > peak) {
      peak = v;
    }
  }
  return { current: values[n - 1], average: sum / n, peak };
}

export interface HourRow {
  /** Начало часа, мс от эпохи. */
  hourStart: number;
  average: number;
  peak: number;
}

/**
 * Группирует замеры по календарным часам. `timeline` должен быть отсортирован по
 * возрастанию, тогда группы идут подряд и достаточно сравнивать с последней.
 */
export function hourlyRows(
  timeline: readonly number[],
  values: readonly number[],
  hourMs = HOUR_MS,
): HourRow[] {
  const groups: { hourStart: number; sum: number; count: number; peak: number }[] = [];
  for (let i = 0; i < timeline.length; i++) {
    const hourStart = Math.floor(timeline[i] / hourMs) * hourMs;
    let group = groups[groups.length - 1];
    if (!group || group.hourStart !== hourStart) {
      group = { hourStart, sum: 0, count: 0, peak: -Infinity };
      groups.push(group);
    }
    const v = values[i];
    group.sum += v;
    group.count += 1;
    if (v > group.peak) {
      group.peak = v;
    }
  }
  return groups.map((g) => ({ hourStart: g.hourStart, average: g.sum / g.count, peak: g.peak }));
}
