import type {AlignedData} from 'uplot';

import {MAX_SERIES} from './palette';
import type {ChartPoint, ChartSeries} from './types';

export function capSeries(series: readonly ChartSeries[]): {visible: ChartSeries[]; hiddenCount: number} {
    return {
        visible: series.slice(0, MAX_SERIES),
        hiddenCount: Math.max(0, series.length - MAX_SERIES),
    };
}

export interface SeriesSummary {
    count: number;
    last: number | null;
    min: number | null;
    max: number | null;
    avg: number | null;
}

export function summarize(points: readonly ChartPoint[]): SeriesSummary {
    if (points.length === 0) {
        return {count: 0, last: null, min: null, max: null, avg: null};
    }
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const {y} of points) {
        if (y < min) min = y;
        if (y > max) max = y;
        sum += y;
    }
    return {
        count: points.length,
        last: points[points.length - 1].y,
        min,
        max,
        avg: sum / points.length,
    };
}

/**
 * Merges series with different timestamps into uPlot's aligned layout:
 * one shared, ascending x column (in seconds) and one column per series,
 * with `null` where a series has no sample at that x.
 */
export function alignForUplot(series: readonly ChartSeries[]): AlignedData {
    const xs = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort((a, b) => a - b);
    const rowOf = new Map<number, number>();
    xs.forEach((x, row) => rowOf.set(x, row));

    const columns = series.map((s) => {
        const column: (number | null)[] = new Array(xs.length).fill(null);
        for (const p of s.points) {
            const row = rowOf.get(p.x);
            if (row !== undefined && Number.isFinite(p.y)) {
                column[row] = p.y;
            }
        }
        return column;
    });

    return [xs.map((x) => x / 1000), ...columns] as AlignedData;
}

const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export function defaultFormatValue(value: number, unit: string): string {
    const formatted = numberFormat.format(value);
    return unit ? `${formatted} ${unit}` : formatted;
}
