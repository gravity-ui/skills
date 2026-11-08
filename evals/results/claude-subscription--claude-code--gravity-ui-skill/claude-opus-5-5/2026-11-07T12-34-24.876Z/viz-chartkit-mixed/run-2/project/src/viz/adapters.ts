import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {TimeSeriesSet, VisualizationView} from './types';

export function isEmptySet({timeline, series}: TimeSeriesSet): boolean {
    return timeline.length === 0 || series.length === 0;
}

function withUnit(unit?: string): string | undefined {
    return unit ? ` ${unit}` : undefined;
}

function formatValue(value: string | number | null, precision: number, unit?: string): string {
    if (value === null || value === '') {
        return '—';
    }
    const num = typeof value === 'number' ? value : Number(value);
    const text = Number.isFinite(num) ? num.toFixed(precision) : String(value);
    return `${text}${withUnit(unit) ?? ''}`;
}

/** Режим «Продажи»: декларативный линейный график на `@gravity-ui/charts`. */
export function toSalesChartData(view: VisualizationView): ChartData {
    const {data, unit, precision = 0} = view;

    const series: LineSeries[] = data.series.map((s) => ({
        type: 'line',
        id: s.id,
        name: s.name,
        marker: {enabled: true},
        data: data.timeline.map((x, i) => ({x, y: s.values[i] ?? null})),
    }));

    return {
        xAxis: {type: 'datetime'},
        yAxis: [
            {
                title: unit ? {text: unit} : undefined,
                labels: {numberFormat: {precision}},
            },
        ],
        legend: {enabled: series.length > 1},
        tooltip: {
            valueFormat: {type: 'number', precision, postfix: withUnit(unit)},
        },
        series: {data: series},
    };
}

/** Режим «Мониторинг»: плотный временной ряд на canvas-движке `@gravity-ui/yagr`. */
export function toMonitoringYagrData(view: VisualizationView): YagrWidgetData {
    const {data, unit, precision = 1} = view;

    return {
        data: {
            timeline: data.timeline,
            graphs: data.series.map((s) => ({
                id: s.id,
                name: s.name,
                data: s.values,
            })),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', width: 1.5},
                select: {zoom: true},
                timeMultiplier: 1,
            },
            axes: {
                y: {
                    precision,
                    values: (_u, ticks) => ticks.map((t) => formatValue(t, Number.isInteger(t) ? 0 : precision, unit)),
                },
            },
            legend: {show: data.series.length > 1, position: 'bottom'},
            tooltip: {
                precision,
                value: (v) => formatValue(v, precision, unit),
            },
        },
    };
}
