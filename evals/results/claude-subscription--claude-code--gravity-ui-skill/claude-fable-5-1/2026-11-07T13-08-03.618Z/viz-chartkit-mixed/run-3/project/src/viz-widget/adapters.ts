import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {MonitoringDataset, SalesDataset} from './types';

/**
 * Adapts the widget's sales dataset to the declarative `@gravity-ui/charts` config
 * consumed by the `gravity-charts` ChartKit plugin.
 */
export function toGravityChartsData(dataset: SalesDataset): ChartData {
    const unit = dataset.unit ? ` ${dataset.unit}` : '';

    return {
        series: {
            data: dataset.series.map((s) => ({
                type: 'line',
                name: s.name,
                lineWidth: 2,
                marker: {enabled: false},
                data: s.data.map((p) => ({x: p.x, y: p.y})),
            })),
        },
        xAxis: {
            type: 'datetime',
        },
        yAxis: [
            {
                labels: {
                    numberFormat: {showRankDelimiter: true, unit: 'auto', postfix: unit},
                },
            },
        ],
        legend: {
            // A single series needs no legend: the widget title names it.
            enabled: dataset.series.length > 1,
            position: 'bottom',
        },
        tooltip: {
            headerFormat: {type: 'date', format: 'DD MMM YYYY'},
            valueFormat: {type: 'number', showRankDelimiter: true, postfix: unit},
        },
    };
}

/**
 * Adapts the widget's monitoring dataset to `YagrWidgetData` consumed by the `yagr`
 * ChartKit plugin (canvas renderer built for dense realtime series).
 */
export function toYagrData(dataset: MonitoringDataset): YagrWidgetData {
    const unit = dataset.unit ?? '';

    return {
        data: {
            timeline: dataset.timeline,
            graphs: dataset.series.map((s, index) => ({
                id: `metric-${index}`,
                name: s.name,
                type: 'line',
                width: 1,
                spanGaps: false,
                data: s.values,
            })),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', width: 1},
                select: {zoom: true},
                timeMultiplier: 1,
            },
            axes: {
                y: {
                    label: unit,
                    precision: 'auto',
                },
            },
            scales: {
                y: {min: 0},
            },
            cursor: {
                snapToValues: 'closest',
            },
            tooltip: {
                show: true,
                sum: false,
            },
            legend: {
                show: dataset.series.length > 1,
            },
        },
    };
}
