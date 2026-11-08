import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {VizDataset} from './types';

const DEFAULT_PRECISION = 0;

/** Единый набор данных → конфиг плагина `gravity-charts` (режим «Продажи»). */
export function toGravityChartsData(dataset: VizDataset): ChartData {
    const precision = dataset.precision ?? DEFAULT_PRECISION;

    return {
        title: {text: dataset.title},
        legend: {enabled: true},
        xAxis: {type: 'datetime'},
        yAxis: [
            {
                title: {text: dataset.valueTitle ?? ''},
                labels: {numberFormat: {precision}},
            },
        ],
        tooltip: {valueFormat: {type: 'number', precision}},
        series: {
            data: dataset.series.map((serie) => ({
                type: 'line',
                name: serie.name,
                color: serie.color,
                data: dataset.timeline.map((x, index) => ({x, y: serie.values[index] ?? null})),
            })),
        },
    };
}

/** Единый набор данных → конфиг плагина `yagr` (режим «Мониторинг»). */
export function toYagrData(dataset: VizDataset): YagrWidgetData {
    const precision = dataset.precision ?? DEFAULT_PRECISION;

    return {
        data: {
            timeline: dataset.timeline,
            graphs: dataset.series.map((serie) => ({
                id: serie.id,
                name: serie.name,
                color: serie.color,
                type: 'line',
                width: 1,
                precision,
                data: serie.values,
            })),
        },
        libraryConfig: {
            title: {text: dataset.title},
            chart: {
                series: {type: 'line'},
                select: {zoom: true},
            },
            legend: {show: true},
            axes: {
                y: {label: dataset.valueTitle, precision},
            },
            scales: {y: {min: 0}},
            tooltip: {sum: false},
        },
    };
}
