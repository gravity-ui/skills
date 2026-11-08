import type {ChartKitWidget} from '@gravity-ui/chartkit';

import type {TimeSeriesDataset, VisualizationMode} from './types';

type GravityChartsData = ChartKitWidget['gravity-charts']['data'];
type YagrData = ChartKitWidget['yagr']['data'];

/** Обычный линейный график продаж — @gravity-ui/charts (SVG, богатые подписи и легенда). */
export function toGravityChartsData(dataset: TimeSeriesDataset): GravityChartsData {
    return {
        series: {
            data: dataset.series.map((series) => ({
                type: 'line',
                id: series.id,
                name: series.name,
                data: dataset.timestamps.map((x, i) => ({x, y: series.values[i] ?? null})),
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [{title: dataset.unit ? {text: dataset.unit} : undefined}],
        legend: {enabled: true},
    };
}

/** Плотный временной ряд мониторинга — @gravity-ui/yagr (canvas, uPlot). */
export function toYagrData(dataset: TimeSeriesDataset): YagrData {
    return {
        data: {
            timeline: dataset.timestamps,
            graphs: dataset.series.map((series) => ({
                id: series.id,
                name: series.name,
                data: series.values,
            })),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', spanGaps: false},
                select: {zoom: true},
                timeMultiplier: 1,
            },
            axes: dataset.unit ? {y: {label: dataset.unit}} : undefined,
            legend: {show: true, position: 'bottom'},
        },
    };
}

/** Возвращает текст ошибки, если датасет некорректен, иначе `null`. */
export function validateDataset(dataset: TimeSeriesDataset): string | null {
    const length = dataset.timestamps.length;
    const broken = dataset.series.find((series) => series.values.length !== length);
    if (broken) {
        return `Ряд «${broken.name}»: ${broken.values.length} значений при ${length} метках времени`;
    }
    return null;
}

export function isDatasetEmpty(dataset: TimeSeriesDataset): boolean {
    return dataset.timestamps.length === 0 || dataset.series.length === 0;
}

export const MODE_LABELS: Record<VisualizationMode, string> = {
    sales: 'Продажи',
    monitoring: 'Мониторинг',
};

export const MODE_HINTS: Record<VisualizationMode, string> = {
    sales: 'Линейный график по месяцам',
    monitoring: 'Плотный временной ряд, выделите область для зума',
};
