import {settings} from '@gravity-ui/chartkit';
import {GravityChartsPlugin} from '@gravity-ui/chartkit/gravity-charts';
import type {ChartData, LineSeries} from '@gravity-ui/chartkit/gravity-charts';

import type {VizDataset, VizEngine, VizRenderContext} from '../types';

const TYPE = 'gravity-charts' as const;

function register() {
    const plugins = settings.get('plugins');
    if (!plugins.some((plugin) => plugin.type === TYPE)) {
        settings.set({plugins: [GravityChartsPlugin]});
    }
}

function build(dataset: VizDataset, ctx: VizRenderContext) {
    const precision = dataset.precision ?? 0;
    const valueFormat = {
        type: 'number' as const,
        precision,
        postfix: dataset.unit ? ` ${dataset.unit}` : undefined,
    };

    const series: LineSeries[] = dataset.series.map((s, index) => ({
        type: 'line',
        id: s.id,
        name: s.name,
        color: ctx.colors[index],
        lineWidth: 2,
        nullMode: 'skip',
        marker: {enabled: false, radius: 4},
        tooltip: {valueFormat},
        data: dataset.timeline.map((x, i) => ({x, y: s.values[i] ?? null})),
    }));

    const data: ChartData = {
        // Заголовок рисует шапка виджета, внутри графика его не дублируем.
        chart: {margin: {top: 12, right: 16, bottom: 8, left: 8}},
        legend: {enabled: dataset.series.length > 1, itemDistance: 16},
        tooltip: {enabled: true, valueFormat},
        xAxis: {
            type: 'datetime',
            crosshair: {enabled: true, snap: true, width: 1, opacity: 0.6},
            lineVisible: false,
            labels: {enabled: true},
        },
        yAxis: [
            {
                type: 'linear',
                lineVisible: false,
                labels: {
                    enabled: true,
                    numberFormat: {precision},
                },
                title: dataset.unit ? {text: dataset.unit, align: 'right'} : undefined,
                grid: {enabled: true},
            },
        ],
        series: {data: series},
    };

    return {type: TYPE, data};
}

export const engine: VizEngine = {
    type: TYPE,
    register,
    build,
};
