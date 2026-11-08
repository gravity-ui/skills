import type {ChartKitType, ChartKitWidget} from '@gravity-ui/chartkit';

import {type ColorScheme, getSeriesColors} from './colors';
import type {ChartWidgetDataset, ChartWidgetMode} from './types';

export type ChartKitConfig = {
    [T in ChartKitType]: {type: T; data: ChartKitWidget[T]['data']};
}[ChartKitType];

interface AdapterOptions {
    colorScheme: ColorScheme;
}

function withUnit(unit?: string) {
    return unit ? ` ${unit}` : '';
}

/** Обычный линейный график (gravity-charts): немного точек, маркеры, подробный тултип. */
export function toGravityChartsConfig(
    dataset: ChartWidgetDataset,
    {colorScheme}: AdapterOptions,
): ChartKitConfig {
    const colors = getSeriesColors(colorScheme);
    const precision = dataset.precision ?? 0;

    return {
        type: 'gravity-charts',
        data: {
            colors,
            legend: {enabled: dataset.series.length > 1},
            xAxis: {type: 'datetime', labels: {dateFormat: 'MMM'}},
            yAxis: [
                {
                    labels: {numberFormat: {precision: 1, unit: 'auto'}},
                    title: dataset.unit ? {text: dataset.unit} : undefined,
                },
            ],
            tooltip: {
                valueFormat: {type: 'number', precision, postfix: withUnit(dataset.unit)},
            },
            series: {
                data: dataset.series.map((serie, index) => ({
                    type: 'line',
                    id: serie.id,
                    name: serie.name,
                    color: colors[index],
                    lineWidth: 2,
                    marker: {enabled: true, radius: 4},
                    data: serie.points.map(([x, y]) => ({x, y})),
                })),
            },
        },
    };
}

/** Плотный временной ряд (yagr/uPlot): тысячи точек, общий timeline, zoom выделением. */
export function toYagrConfig(dataset: ChartWidgetDataset, {colorScheme}: AdapterOptions): ChartKitConfig {
    const colors = getSeriesColors(colorScheme);
    const precision = dataset.precision ?? 0;

    // yagr требует общий timeline и выровненные по нему массивы значений.
    const timeline = Array.from(
        new Set(dataset.series.flatMap((serie) => serie.points.map(([ts]) => ts))),
    ).sort((a, b) => a - b);
    const indexByTs = new Map(timeline.map((ts, index) => [ts, index]));

    const graphs = dataset.series.map((serie, index) => {
        const data: (number | null)[] = new Array(timeline.length).fill(null);
        for (const [ts, value] of serie.points) {
            data[indexByTs.get(ts)!] = value;
        }
        return {id: serie.id, name: serie.name, color: colors[index], data};
    });

    return {
        type: 'yagr',
        data: {
            data: {timeline, graphs},
            libraryConfig: {
                chart: {
                    series: {type: 'line', width: 1.5, spanGaps: false},
                    select: {zoom: true},
                },
                axes: {
                    y: {
                        precision,
                        values: (_, ticks) => ticks.map((tick) => `${tick}${withUnit(dataset.unit)}`),
                    },
                },
                scales: {y: {min: 0}},
                legend: {show: dataset.series.length > 1},
                tooltip: {show: true, precision, value: (value) => formatValue(value, precision, dataset.unit)},
            },
        },
    };
}

function formatValue(value: unknown, precision: number, unit?: string) {
    return typeof value === 'number' ? `${value.toFixed(precision)}${withUnit(unit)}` : '—';
}

export const MODE_ADAPTERS: Record<
    ChartWidgetMode,
    (dataset: ChartWidgetDataset, options: AdapterOptions) => ChartKitConfig
> = {
    sales: toGravityChartsConfig,
    monitoring: toYagrConfig,
};

export function toChartKitConfig(
    mode: ChartWidgetMode,
    dataset: ChartWidgetDataset,
    options: AdapterOptions,
): ChartKitConfig {
    return MODE_ADAPTERS[mode](dataset, options);
}
