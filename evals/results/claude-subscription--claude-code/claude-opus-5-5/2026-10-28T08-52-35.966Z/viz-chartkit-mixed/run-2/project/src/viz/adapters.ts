// Pure converters from the widget's `VizDataset` into each ChartKit plugin's data format.
// Only type imports from the engines here, so this module never pulls chart code into the bundle.
import type {ChartKitWidget} from '@gravity-ui/chartkit';

import {getSeriesColor, type PaletteTheme} from './palette';
import type {VizDataset} from './types';

export type GravityChartsData = ChartKitWidget['gravity-charts']['data'];
export type YagrData = ChartKitWidget['yagr']['data'];

const EMPTY_VALUE = '—';

export function validateDataset(dataset: VizDataset): void {
    const {timeline, series} = dataset;
    if (timeline.length === 0) {
        throw new Error('Нет данных для отображения');
    }
    for (let i = 1; i < timeline.length; i++) {
        if (timeline[i] <= timeline[i - 1]) {
            throw new Error(`Временная шкала должна строго возрастать (индекс ${i})`);
        }
    }
    for (const s of series) {
        if (s.values.length !== timeline.length) {
            throw new Error(
                `Серия «${s.name}»: ${s.values.length} значений при ${timeline.length} точках шкалы`,
            );
        }
    }
}

function resolveColors(dataset: VizDataset, theme: PaletteTheme): string[] {
    return dataset.series.map((s, i) => s.color ?? getSeriesColor(i, theme));
}

export function toGravityChartsData(dataset: VizDataset, theme: PaletteTheme): GravityChartsData {
    validateDataset(dataset);
    const colors = resolveColors(dataset, theme);
    const {formatValue} = dataset;

    return {
        xAxis: {type: 'datetime', crosshair: {enabled: true}},
        legend: {enabled: true},
        tooltip: formatValue
            ? {
                  valueFormat: {
                      type: 'custom',
                      formatter: ({value}) =>
                          typeof value === 'number' ? formatValue(value) : EMPTY_VALUE,
                  },
              }
            : undefined,
        series: {
            data: dataset.series.map((s, i) => ({
                type: 'line',
                id: s.id,
                name: s.name,
                color: colors[i],
                lineWidth: 2,
                data: s.values.map((y, j) => ({x: dataset.timeline[j], y})),
            })),
        },
    };
}

export function toYagrData(dataset: VizDataset, theme: PaletteTheme): YagrData {
    validateDataset(dataset);
    const colors = resolveColors(dataset, theme);
    const {formatValue} = dataset;

    return {
        data: {
            timeline: [...dataset.timeline],
            graphs: dataset.series.map((s, i) => ({
                id: s.id,
                name: s.name,
                color: colors[i],
                data: [...s.values],
                formatter: formatValue
                    ? (value) => (typeof value === 'number' ? formatValue(value) : EMPTY_VALUE)
                    : undefined,
            })),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', width: 1.5, spanGaps: false},
                select: {zoom: true},
            },
            legend: {show: true},
            tooltip: {show: true},
            axes: {y: {precision: 'auto'}},
        },
    };
}
