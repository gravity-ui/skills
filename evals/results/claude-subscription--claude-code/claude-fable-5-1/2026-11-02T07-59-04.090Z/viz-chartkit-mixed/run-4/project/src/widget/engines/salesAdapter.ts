import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';

import type {VizDataset, VizRenderContext} from '../types';

/**
 * Чистое преобразование единого датасета в конфиг Gravity Charts
 * (режим «Продажи»: немного точек, акцент на читаемость).
 */
export function toGravityChartsData(dataset: VizDataset, ctx: VizRenderContext): ChartData {
    const series: LineSeries[] = dataset.series.map((s, index) => ({
        type: 'line',
        id: s.id,
        name: s.name,
        color: ctx.palette[index % ctx.palette.length],
        linecap: 'round',
        linejoin: 'round',
        nullMode: 'skip',
        marker: {enabled: false},
        data: s.points.map((p) => ({x: p.t, y: p.y})),
    }));

    const unit = dataset.unit;

    return {
        series: {
            data: series,
            options: {
                line: {
                    lineWidth: 2,
                    states: {
                        hover: {marker: {enabled: true, radius: 4, borderWidth: 2}},
                    },
                },
            },
        },
        xAxis: {
            type: 'datetime',
            grid: {enabled: false},
            lineVisible: true,
            labels: {dateTimeLabelFormats: {month: 'MMM YYYY', day: 'DD MMM'}},
            crosshair: {enabled: true, snap: true},
        },
        yAxis: [
            {
                type: 'linear',
                min: dataset.yMin,
                max: dataset.yMax,
                lineVisible: false,
                title: unit ? {text: unit} : undefined,
                labels: {numberFormat: {precision: 'auto'}},
            },
        ],
        // Легенда нужна при двух и более сериях: идентичность не должна держаться на одном цвете.
        legend: {enabled: series.length > 1, position: 'bottom', align: 'left'},
        tooltip: {enabled: true},
    };
}
