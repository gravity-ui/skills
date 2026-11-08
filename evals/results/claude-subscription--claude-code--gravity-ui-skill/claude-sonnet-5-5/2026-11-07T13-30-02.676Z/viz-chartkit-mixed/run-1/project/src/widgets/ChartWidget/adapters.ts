import type {ChartKitProps} from '@gravity-ui/chartkit';

import type {MonitoringData, SalesSeries} from './types';

/** Regular line chart → `gravity-charts` engine. */
export function toSalesChartData(sales: SalesSeries[]): ChartKitProps<'gravity-charts'>['data'] {
    return {
        series: {
            data: sales.map((s) => ({
                type: 'line' as const,
                name: s.name,
                data: s.points,
            })),
        },
        xAxis: {type: 'datetime'},
        yAxis: [{type: 'linear', title: {text: 'Revenue'}}],
    };
}

/** Dense time series → `yagr` engine. */
export function toMonitoringChartData({timeline, series}: MonitoringData): ChartKitProps<'yagr'>['data'] {
    return {
        data: {
            timeline,
            graphs: series.map((s) => ({id: s.id, name: s.name, data: s.values})),
        },
        libraryConfig: {
            chart: {series: {type: 'line', spanGaps: false}},
        },
    };
}
