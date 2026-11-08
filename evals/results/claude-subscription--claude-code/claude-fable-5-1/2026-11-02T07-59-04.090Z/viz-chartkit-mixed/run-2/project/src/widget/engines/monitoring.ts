import {YagrPlugin} from '@gravity-ui/chartkit/yagr';
import type {RawSerieData, YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {CHROME} from '../palette';
import type {ChartEngine, EngineContext, TimeSeriesDataset} from '../types';

/**
 * Движок «мониторинг»: плотный ряд (тысячи точек) на canvas-движке yagr/uPlot.
 * Все серии кладутся на общую временную шкалу; пропуски оставляются как null.
 */
export function buildMonitoringData(dataset: TimeSeriesDataset, ctx: EngineContext): YagrWidgetData {
    const chrome = CHROME[ctx.theme];
    const precision = dataset.precision ?? 1;

    const timelineSet = new Set<number>();
    for (const s of dataset.series) {
        for (const p of s.points) {
            timelineSet.add(p.x);
        }
    }
    const timeline = Array.from(timelineSet).sort((a, b) => a - b);
    const indexByTs = new Map<number, number>();
    timeline.forEach((ts, i) => indexByTs.set(ts, i));

    const graphs: RawSerieData[] = dataset.series.map((s, i) => {
        const data: (number | null)[] = new Array(timeline.length).fill(null);
        for (const p of s.points) {
            const idx = indexByTs.get(p.x);
            if (idx !== undefined) {
                data[idx] = p.y;
            }
        }
        return {
            id: s.id,
            name: s.name,
            color: ctx.colors[i % ctx.colors.length],
            type: 'line',
            width: 2,
            spanGaps: false,
            precision,
            data,
        };
    });

    return {
        data: {graphs, timeline, timeZone: dataset.timeZone},
        libraryConfig: {
            chart: {
                series: {type: 'line'},
                select: {zoom: true},
                size: {adaptive: true},
                // Сетка под данными, а не поверх них.
                appearance: {drawOrder: ['plotLines', 'axes', 'series']},
            },
            legend: {show: dataset.series.length > 1, position: 'bottom'},
            cursor: {
                x: {visible: true, style: `1px solid ${chrome.muted}`},
                y: {visible: false},
                markersSize: 8,
                snapToValues: 'closest',
            },
            tooltip: {
                show: true,
                tracking: 'sticky',
                sum: false,
                highlight: true,
                maxLines: 10,
                // Порядок строк как в исходных данных (ChartKit по умолчанию разворачивает его).
                sort: (a, b) => a.rowIdx - b.rowIdx,
            },
            axes: {
                x: {grid: {show: false}},
                y: {
                    label: dataset.valueLabel,
                    precision: 0,
                    grid: {show: true, width: 1},
                    splitsCount: 5,
                },
            },
            scales: {y: {min: 0, range: 'nice'}},
        },
    };
}

export const engine: ChartEngine<'yagr'> = {
    mode: 'monitoring',
    type: 'yagr',
    plugin: YagrPlugin,
    buildData: buildMonitoringData,
};
