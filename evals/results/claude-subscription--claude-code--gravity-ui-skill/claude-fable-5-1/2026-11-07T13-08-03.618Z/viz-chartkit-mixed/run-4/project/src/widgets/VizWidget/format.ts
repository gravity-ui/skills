import type {VizSeries, VizValueFormat} from './types';

const formatters = new Map<number, Intl.NumberFormat>();

function getNumberFormat(precision: number): Intl.NumberFormat {
    let formatter = formatters.get(precision);

    if (!formatter) {
        formatter = new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
        });
        formatters.set(precision, formatter);
    }

    return formatter;
}

/** Formats a value consistently for tooltips, axes and the summary table. */
export function formatValue(value: number | null | undefined, format?: VizValueFormat): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }

    const precision = format?.precision ?? 0;

    return `${getNumberFormat(precision).format(value)}${format?.postfix ?? ''}`;
}

export interface SeriesSummary {
    last: number | null;
    min: number | null;
    max: number | null;
    avg: number | null;
}

/** Last / min / max / mean of a series, ignoring gaps. */
export function summarizeSeries(series: VizSeries): SeriesSummary {
    let last: number | null = null;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let sum = 0;
    let count = 0;

    for (const value of series.values) {
        if (value === null || Number.isNaN(value)) {
            continue;
        }

        last = value;
        min = Math.min(min, value);
        max = Math.max(max, value);
        sum += value;
        count += 1;
    }

    if (count === 0) {
        return {last: null, min: null, max: null, avg: null};
    }

    return {last, min, max, avg: sum / count};
}
