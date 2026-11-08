import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';

import {CHROME} from '../palette';
import type {ChartEngine, EngineContext, TimeSeriesDataset} from '../types';

/**
 * Движок «продажи»: разреженный ряд (десятки точек) на SVG-движке gravity-charts.
 * Линии 2px, подпись значения только на последней точке, общая подсказка с crosshair.
 */
export function buildSalesData(dataset: TimeSeriesDataset, ctx: EngineContext): ChartData {
    const chrome = CHROME[ctx.theme];
    const precision = dataset.precision ?? 0;
    const unitPostfix = dataset.unit ? ` ${dataset.unit}` : undefined;

    const series: LineSeries[] = dataset.series.map((s) => {
        const lastIndex = s.points.length - 1;
        return {
            type: 'line',
            name: s.name,
            lineWidth: 2,
            linecap: 'round',
            linejoin: 'round',
            interpolation: {type: 'monotone'},
            nullMode: 'skip',
            marker: {enabled: false, radius: 4, symbol: 'circle'},
            dataLabels: {
                enabled: true,
                placement: ['right', 'top', 'bottom'],
                placementFallback: 'show',
                format: {type: 'number', precision, postfix: unitPostfix, showRankDelimiter: true},
            },
            data: s.points.map((p, i) => ({
                x: p.x,
                y: p.y,
                dataLabels: {enabled: i === lastIndex && p.y !== null},
            })),
        };
    });

    return {
        colors: ctx.colors,
        legend: {enabled: dataset.series.length > 1, position: 'bottom', align: 'left'},
        xAxis: {
            type: 'datetime',
            grid: {enabled: false},
            lineColor: chrome.axis,
            crosshair: {enabled: true, snap: true, color: chrome.muted, width: 1},
            labels: {
                dateTimeLabelFormats: {month: 'MMM YY', day: 'DD MMM', year: 'YYYY'},
                style: {fontSize: '12px', fontColor: chrome.muted},
            },
            padding: {max: 56},
        },
        yAxis: [
            {
                type: 'linear',
                min: 0,
                lineVisible: false,
                grid: {enabled: true},
                title: dataset.valueLabel ? {text: dataset.valueLabel} : undefined,
                labels: {
                    numberFormat: {precision: 0, showRankDelimiter: true},
                    style: {fontSize: '12px', fontColor: chrome.muted},
                },
            },
        ],
        tooltip: {
            enabled: true,
            valueFormat: {type: 'number', precision, postfix: unitPostfix, showRankDelimiter: true},
        },
        series: {
            data: series,
            options: {
                line: {
                    lineWidth: 2,
                    states: {
                        hover: {enabled: true, marker: {enabled: true, radius: 4}},
                        inactive: {enabled: true, opacity: 0.35},
                    },
                },
            },
        },
    };
}

export const engine: ChartEngine<'gravity-charts'> = {
    mode: 'sales',
    type: 'gravity-charts',
    plugin: GravityChartsPlugin,
    buildData: buildSalesData,
};
