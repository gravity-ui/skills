/**
 * Pure adapters from the widget's unified series model to each engine's config.
 *
 * This module imports only *types* from the Gravity UI charting packages, so it
 * never pulls their runtime into the main bundle. The engines are loaded lazily.
 */
import type {ChartData} from '@gravity-ui/charts';
import type {MinimalValidConfig, RawSerieData} from '@gravity-ui/yagr';

import type {TimeSeries, WidgetTheme} from './types';

/** Sales engine: `@gravity-ui/charts` datetime line chart. */
export function toSalesChartData(series: TimeSeries[]): ChartData {
    return {
        xAxis: {type: 'datetime'},
        series: {
            data: series.map((s) => ({
                type: 'line' as const,
                name: s.name,
                color: s.color,
                data: s.points.map((p) => ({x: p.t, y: p.v})),
            })),
        },
    };
}

/**
 * Sorted, de-duplicated union of all timestamps across series.
 * Yagr aligns every series to one shared timeline, so each series is re-indexed onto it.
 */
export function unionTimeline(series: TimeSeries[]): number[] {
    const stamps = new Set<number>();
    for (const s of series) {
        for (const p of s.points) {
            stamps.add(p.t);
        }
    }
    return [...stamps].sort((a, b) => a - b);
}

/**
 * Monitoring engine: `@gravity-ui/yagr` (canvas, uPlot-based) config.
 * `timeMultiplier: 1` means the timeline is in epoch milliseconds, matching the widget model.
 */
export function toMonitoringConfig(series: TimeSeries[], theme: WidgetTheme): MinimalValidConfig {
    const timeline = unionTimeline(series);

    return {
        timeline,
        chart: {
            timeMultiplier: 1,
            appearance: {theme},
        },
        series: series.map((s): RawSerieData => {
            const byTime = new Map(s.points.map((p) => [p.t, p.v]));
            return {
                id: s.id,
                name: s.name,
                type: 'line',
                color: s.color,
                data: timeline.map((t) => byTime.get(t) ?? null),
            };
        }),
    };
}
