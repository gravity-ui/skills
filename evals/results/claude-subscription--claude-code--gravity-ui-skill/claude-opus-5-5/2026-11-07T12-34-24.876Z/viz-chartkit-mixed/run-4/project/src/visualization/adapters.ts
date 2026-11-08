// Type-only imports: they are erased at build time and never pull an engine
// into the main bundle. Engines are loaded lazily by the ChartKit plugins.
import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {TimeSeries, VisualizationDataset} from './types';

export function isDatasetEmpty(dataset: VisualizationDataset): boolean {
    return dataset.series.every((s) => s.timestamps.length === 0);
}

/** Sales mode: a regular SVG line chart with markers on every point. */
export function toGravityChartsData(dataset: VisualizationDataset): ChartData {
    return {
        series: {
            data: dataset.series.map((s) => ({
                type: 'line',
                id: s.id,
                name: s.name,
                marker: {enabled: true},
                data: s.timestamps.map((x, i) => ({x, y: s.values[i] ?? null})),
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [{title: dataset.yAxisTitle ? {text: dataset.yAxisTitle} : undefined}],
        legend: {enabled: dataset.series.length > 1},
    };
}

/**
 * Yagr expects a single shared timeline with every graph aligned to it.
 * Series may be sampled at different moments, so build the union of all
 * timestamps and fill missing points with `null` (rendered as gaps).
 */
function alignToSharedTimeline(series: TimeSeries[]) {
    const timelineSet = new Set<number>();
    for (const s of series) {
        for (const ts of s.timestamps) {
            timelineSet.add(ts);
        }
    }
    const timeline = Array.from(timelineSet).sort((a, b) => a - b);
    const indexByTs = new Map<number, number>();
    timeline.forEach((ts, i) => indexByTs.set(ts, i));

    const aligned = series.map((s) => {
        const data: Array<number | null> = new Array(timeline.length).fill(null);
        s.timestamps.forEach((ts, i) => {
            data[indexByTs.get(ts)!] = s.values[i] ?? null;
        });
        return data;
    });

    return {timeline, aligned};
}

/** Monitoring mode: dense canvas time series with drag-to-zoom. */
export function toYagrData(dataset: VisualizationDataset): YagrWidgetData {
    const {timeline, aligned} = alignToSharedTimeline(dataset.series);

    return {
        data: {
            timeline,
            timeZone: dataset.timeZone,
            graphs: dataset.series.map((s, i) => ({
                id: s.id,
                name: s.name,
                data: aligned[i],
            })),
        },
        libraryConfig: {
            chart: {
                series: {type: 'line', width: 1, spanGaps: false},
                select: {zoom: true},
            },
            legend: {show: dataset.series.length > 1, position: 'bottom'},
            tooltip: {show: true},
        },
    };
}
