import {SERIES_LIMIT} from './palette';
import type {VizSeries} from './types';

/** Returns a user-facing problem with the input, or `null` if the series can be drawn. */
export function validateSeries(series: VizSeries[]): string | null {
  if (series.length > SERIES_LIMIT) {
    return `Серий больше ${SERIES_LIMIT}: ${series.length}. Сгруппируйте хвост в «Прочее» или разбейте на несколько виджетов.`;
  }
  const ids = new Set<string>();
  for (const s of series) {
    if (ids.has(s.id)) {
      return `Повторяющийся id серии: ${s.id}`;
    }
    ids.add(s.id);
    for (let i = 1; i < s.points.length; i += 1) {
      if (s.points[i].t <= s.points[i - 1].t) {
        return `Точки серии «${s.name}» должны идти по возрастанию времени (индекс ${i}).`;
      }
    }
  }
  return null;
}

/** Sorted union of every timestamp across all series. Used to align series for yagr. */
export function buildTimeline(series: VizSeries[]): number[] {
  const all = new Set<number>();
  for (const s of series) {
    for (const p of s.points) {
      all.add(p.t);
    }
  }
  return [...all].sort((a, b) => a - b);
}

const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 0});

export function formatValue(value: number, unit?: string): string {
  const formatted = numberFormat.format(value);
  return unit ? `${formatted} ${unit}` : formatted;
}

export interface SeriesSummary {
  id: string;
  name: string;
  count: number;
  gaps: number;
  last: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
}

/** Per-series summary used by the table view; it is the reader's non-hover path to the numbers. */
export function summarize(series: VizSeries[]): SeriesSummary[] {
  return series.map((s) => {
    let count = 0;
    let gaps = 0;
    let sum = 0;
    let min: number | null = null;
    let max: number | null = null;
    let last: number | null = null;
    for (const p of s.points) {
      if (p.v === null) {
        gaps += 1;
        continue;
      }
      count += 1;
      sum += p.v;
      min = min === null || p.v < min ? p.v : min;
      max = max === null || p.v > max ? p.v : max;
      last = p.v;
    }
    return {
      id: s.id,
      name: s.name,
      count,
      gaps,
      last,
      min,
      max,
      avg: count > 0 ? sum / count : null,
    };
  });
}
