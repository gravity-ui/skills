/**
 * Pure mappers from the unified dataset to each ChartKit plugin's data format.
 * Only types are imported from the plugins, so this module never pulls an engine
 * into the main bundle.
 */
import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {VisualizationDataset, VisualizationView} from './types';

export function countPoints(data: VisualizationDataset): number {
    return data.timestamps.length * data.series.length;
}

export function isEmptyDataset(data: VisualizationDataset): boolean {
    return data.timestamps.length === 0 || data.series.length === 0;
}

/** Throws on a malformed dataset so the widget can show a readable error instead of a broken plot. */
export function assertValidDataset(data: VisualizationDataset): void {
    for (const s of data.series) {
        if (s.values.length !== data.timestamps.length) {
            throw new Error(
                `Ряд «${s.name}»: ${s.values.length} значений на ${data.timestamps.length} отметок времени`,
            );
        }
    }
}

export function toGravityChartsData(view: VisualizationView): ChartData {
    const {data, yAxisTitle, precision} = view;
    const numberFormat = {precision, showRankDelimiter: true};

    return {
        series: {
            data: data.series.map((s) => ({
                type: 'line' as const,
                id: s.id,
                name: s.name,
                data: data.timestamps.map((x, i) => ({x, y: s.values[i]})),
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [
            {
                title: yAxisTitle ? {text: yAxisTitle} : undefined,
                labels: {numberFormat},
            },
        ],
        tooltip: {valueFormat: {type: 'number', ...numberFormat}},
        legend: {enabled: data.series.length > 1},
    };
}

export function toYagrData(view: VisualizationView): YagrWidgetData {
    const {data, yAxisTitle, precision} = view;

    return {
        data: {
            timeline: data.timestamps,
            graphs: data.series.map((s) => ({id: s.id, name: s.name, data: s.values})),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', spanGaps: false},
                // Drag-to-zoom on the time axis — the main way to inspect dense data.
                select: {zoom: true},
            },
            axes: {
                y: {
                    precision: precision ?? 'auto',
                    label: yAxisTitle,
                },
            },
            tooltip: {precision},
            legend: {show: data.series.length > 1, position: 'bottom'},
        },
    };
}
