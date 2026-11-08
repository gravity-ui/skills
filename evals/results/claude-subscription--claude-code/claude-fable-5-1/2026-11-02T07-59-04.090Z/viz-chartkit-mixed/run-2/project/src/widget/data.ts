import type {ChartWidgetData, ChartWidgetMode, TimeSeriesDataset} from './types';
import {MAX_SERIES} from './palette';

function isDataset(data: ChartWidgetData): data is TimeSeriesDataset {
    return Array.isArray((data as TimeSeriesDataset).series);
}

/** Возвращает набор данных для режима; один общий набор используется в обоих режимах. */
export function resolveDataset(data: ChartWidgetData, mode: ChartWidgetMode): TimeSeriesDataset | undefined {
    return isDataset(data) ? data : data[mode];
}

/**
 * Палитра валидирована на три серии; лишние серии в график не попадают,
 * чтобы не генерировать непроверенные оттенки.
 */
export function limitSeries(dataset: TimeSeriesDataset): TimeSeriesDataset {
    if (dataset.series.length <= MAX_SERIES) {
        return dataset;
    }
    return {...dataset, series: dataset.series.slice(0, MAX_SERIES)};
}

export function formatValue(value: number | null | undefined, unit?: string, precision = 0): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return '—';
    }
    const text = value.toLocaleString('ru-RU', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
    });
    return unit ? `${text} ${unit}` : text;
}
