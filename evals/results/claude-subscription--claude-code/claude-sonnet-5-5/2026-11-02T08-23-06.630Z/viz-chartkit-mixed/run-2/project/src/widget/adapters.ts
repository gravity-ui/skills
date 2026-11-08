import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {colorAt} from './palette';
import type {AdapterOptions, TimeSeriesData} from './types';

const nf = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});

export const formatValue = (value: number, unit?: string): string =>
    unit ? `${nf.format(value)} ${unit}` : nf.format(value);

/** Единый формат → конфиг gravity-charts (обычный линейный график). */
export function toGravityChartsData(data: TimeSeriesData, opts: AdapterOptions = {}): ChartData {
    const {unit, title, yMin = 0, yMax} = opts;

    return {
        title: title ? {text: title} : undefined,
        chart: {margin: {top: 16, right: 16, bottom: 8, left: 8}},
        series: {
            data: data.series.map((s, i) => ({
                type: 'line' as const,
                name: s.name,
                color: colorAt(i, s.color),
                lineWidth: 2,
                // Маркеры не рисуем на каждой точке — только при наведении
                marker: {enabled: false},
                data: data.timeline.map((x, idx) => ({x, y: s.values[idx] ?? null})),
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [
            {
                min: yMin,
                max: yMax,
                labels: {numberFormat: {precision: 0, unit: 'auto'}},
            },
        ],
        legend: {enabled: data.series.length > 1},
        tooltip: {
            valueFormat: {type: 'number', precision: 1, postfix: unit ? ` ${unit}` : undefined},
        },
    };
}

/** Единый формат → конфиг yagr (плотный временной ряд, canvas/uPlot). */
export function toYagrData(data: TimeSeriesData, opts: AdapterOptions = {}): YagrWidgetData {
    const {unit, title, yMin = 0, yMax, timeZone} = opts;

    return {
        data: {
            timeline: data.timeline,
            timeZone,
            graphs: data.series.map((s, i) => ({
                id: s.id,
                name: s.name,
                color: colorAt(i, s.color),
                lineWidth: 1.5,
                data: s.values,
            })),
        },
        libraryConfig: {
            title: title ? {text: title} : undefined,
            scales: {y: {min: yMin, max: yMax}},
            axes: {
                y: {precision: 0, label: unit},
            },
            // На плотных рядах маркеры в каждой точке превращаются в сплошную «шубу»
            markers: {show: false},
            legend: {show: data.series.length > 1},
            tooltip: {
                show: true,
                tracking: 'sticky',
                value: (_, v) => (v === null || v === undefined ? '—' : formatValue(Number(v), unit)),
            },
            cursor: {
                // Горизонтальное выделение для зума по времени
                x: {visible: true},
            },
        },
    };
}
