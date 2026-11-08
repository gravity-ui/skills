import type {ChartData, LineSeries, LineSeriesData} from '@gravity-ui/chartkit/gravity-charts';

import type {VisualizationWidgetData} from '../types';

/**
 * Маппит единые данные виджета на конфиг `@gravity-ui/charts` (плагин ChartKit `gravity-charts`):
 * обычный линейный график с datetime-осью X и маркерами точек.
 */
export function toGravityChartsData(input: VisualizationWidgetData): ChartData {
    const series: LineSeries[] = input.series.map((serie) => {
        const points: LineSeriesData[] = [];

        input.timestamps.forEach((x, index) => {
            const y = serie.values[index];
            if (y !== null && y !== undefined) {
                points.push({x, y});
            }
        });

        return {
            type: 'line',
            name: serie.name,
            color: serie.color,
            data: points,
            marker: {enabled: true},
        };
    });

    return {
        series: {data: series},
        xAxis: {
            type: 'datetime',
            grid: {enabled: false},
        },
        yAxis: [
            {
                type: 'linear',
                min: 0,
                title: input.valueLabel ? {text: input.valueLabel} : undefined,
                labels: input.unit ? {numberFormat: {postfix: ` ${input.unit}`}} : undefined,
            },
        ],
        legend: {enabled: true},
        tooltip: {enabled: true},
    };
}
