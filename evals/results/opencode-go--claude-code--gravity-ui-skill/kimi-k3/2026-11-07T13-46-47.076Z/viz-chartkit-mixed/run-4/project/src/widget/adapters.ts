import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {MonitoringData, SalesData} from './types';

/**
 * Categorical palette, assigned to series in fixed order (never cycled back
 * for the first slots). Validated for CVD separation and lightness band on
 * the light chart surface; legend + hover tooltips provide the secondary
 * encoding where a slot's surface contrast is below 3:1.
 */
export const SERIES_COLORS = ['#2a78d6', '#eb6834', '#1baf7a'];

/** Sales mode → `@gravity-ui/charts` config (via the gravity-charts plugin). */
export function toSalesWidgetData(sales: SalesData): ChartData {
    return {
        colors: SERIES_COLORS,
        series: {
            data: sales.series.map((serie) => ({
                type: 'line' as const,
                name: serie.name,
                data: serie.points.map((point) => ({x: point.t, y: point.value})),
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [{title: {text: sales.yAxisTitle ?? ''}}],
        legend: {enabled: true},
    };
}

/** Monitoring mode → `@gravity-ui/yagr` config (via the yagr plugin). */
export function toMonitoringWidgetData(monitoring: MonitoringData): YagrWidgetData {
    return {
        data: {
            timeline: monitoring.timeline,
            timeZone: monitoring.timeZone,
            graphs: monitoring.series.map((serie, index) => ({
                id: serie.name,
                name: serie.name,
                type: 'line' as const,
                data: serie.data,
                color: serie.color ?? SERIES_COLORS[index % SERIES_COLORS.length],
            })),
        },
        libraryConfig: {
            chart: {series: {type: 'line'}},
            tooltip: {show: true},
            legend: {show: true},
        },
    };
}
