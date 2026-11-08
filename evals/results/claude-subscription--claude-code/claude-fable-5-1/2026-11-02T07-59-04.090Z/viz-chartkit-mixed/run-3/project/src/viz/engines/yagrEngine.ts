import {settings} from '@gravity-ui/chartkit';
import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {formatTimestamp, formatValue, isDailyTimeline} from '../format';
import type {VizDataset, VizEngine, VizRenderContext} from '../types';

const TYPE = 'yagr' as const;

function register() {
    const plugins = settings.get('plugins');
    if (!plugins.some((plugin) => plugin.type === TYPE)) {
        settings.set({plugins: [YagrPlugin]});
    }
}

function build(dataset: VizDataset, ctx: VizRenderContext) {
    const precision = dataset.precision ?? 0;
    const daily = isDailyTimeline(dataset.timeline);

    const graphs: RawSerieData[] = dataset.series.map((s, index) => ({
        id: s.id,
        name: s.name,
        color: ctx.colors[index],
        type: 'line',
        width: 1.5,
        spanGaps: false,
        data: s.values,
    }));

    const data: YagrWidgetData = {
        data: {
            graphs,
            timeline: dataset.timeline,
        },
        libraryConfig: {
            chart: {
                appearance: {theme: ctx.theme, locale: ctx.lang},
                series: {type: 'line', width: 1.5, spanGaps: false},
                select: {zoom: true},
                size: {adaptive: true},
            },
            legend: {show: dataset.series.length > 1, position: 'bottom'},
            cursor: {
                snapToValues: 'closest',
                markersSize: 8,
                x: {visible: true, style: '1px solid rgba(128,128,128,0.6)'},
                y: {visible: false},
            },
            tooltip: {
                show: true,
                tracking: 'sticky',
                strategy: 'pin',
                precision,
                sum: false,
                title: ({x}) => formatTimestamp(x, daily),
                value: (value) => formatValue(value, precision, dataset.unit),
                // Нативный рендер Yagr: одна строка на серию, без дублирования активной строки,
                // заголовок даты берётся из `title` выше.
                render: (data) => data.defaultRender(data),
            },
            axes: {
                y: {
                    label: dataset.unit,
                    splitsCount: 5,
                    precision: 'auto',
                },
            },
            grid: {show: true, width: 1},
            scales: {
                y: {min: 0},
            },
        },
    };

    return {type: TYPE, data};
}

export const engine: VizEngine = {
    type: TYPE,
    register,
    build,
};
