import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {formatValue} from './format';
import {getSeriesColor} from './palette';
import type {VizView} from './types';

/**
 * Engine adapters: `VizView` → engine-specific config.
 *
 * Only types are imported here; the engine code itself is fetched lazily in
 * `engines.ts`.
 */

const DEFAULT_DATE_FORMAT = 'DD MMM';

export function toGravityCharts(view: VizView, palette: readonly string[]): ChartData {
    const {timeline, series} = view.data;
    const precision = view.valueFormat?.precision ?? 0;
    const postfix = view.valueFormat?.postfix;
    const hasLegend = series.length > 1;

    return {
        series: {
            data: series.map((item, index) => ({
                type: 'line',
                name: item.name,
                color: getSeriesColor(palette, index),
                lineWidth: 2,
                marker: {enabled: false},
                nullMode: 'skip',
                data: timeline.map((x, pointIndex) => ({x, y: item.values[pointIndex] ?? null})),
            })),
        },
        xAxis: {
            type: 'datetime',
            labels: {dateFormat: view.dateFormat ?? DEFAULT_DATE_FORMAT},
            grid: {enabled: false},
        },
        yAxis: [
            {
                min: 0,
                labels: {numberFormat: {precision, showRankDelimiter: true}},
            },
        ],
        legend: {enabled: hasLegend, position: 'bottom'},
        tooltip: {
            headerFormat: {type: 'date', format: 'DD MMM YYYY'},
            valueFormat: {type: 'number', precision, postfix, showRankDelimiter: true},
        },
        chart: {
            zoom: {enabled: true, type: 'x'},
        },
    };
}

export function toYagr(view: VizView, palette: readonly string[]): YagrWidgetData {
    const {timeline, series} = view.data;
    const format = view.valueFormat;
    const hasLegend = series.length > 1;

    return {
        data: {
            timeline,
            graphs: series.map((item, index) => ({
                id: item.id,
                name: item.name,
                type: 'line',
                width: 1,
                spanGaps: false,
                color: getSeriesColor(palette, index),
                data: item.values,
            })),
        },
        libraryConfig: {
            chart: {
                timeMultiplier: 1,
                series: {type: 'line', width: 1},
                select: {zoom: true},
            },
            scales: {
                y: {min: 0},
            },
            axes: {
                y: {precision: 'auto'},
            },
            legend: {show: hasLegend, position: 'bottom'},
            cursor: {
                x: {visible: true},
                y: {visible: false},
                snapToValues: 'closest',
                markersSize: 8,
            },
            tooltip: {
                show: true,
                sum: false,
                strategy: 'pin',
                value: (value) => formatValue(typeof value === 'number' ? value : null, format),
            },
        },
    };
}
