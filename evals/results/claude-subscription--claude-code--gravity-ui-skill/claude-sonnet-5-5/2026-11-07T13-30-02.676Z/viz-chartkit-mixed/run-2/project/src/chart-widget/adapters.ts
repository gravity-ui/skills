import type {ChartKitWidget} from '@gravity-ui/chartkit';

import type {MonitoringData, SalesSeries} from './types';

// Only types are imported from the plugin modules, so nothing engine-related
// lands in the main bundle.

export function toSalesChart(series: SalesSeries[]): ChartKitWidget['gravity-charts']['data'] {
  return {
    series: {
      data: series.map((s) => ({
        type: 'line' as const,
        name: s.name,
        data: s.points,
      })),
    },
    xAxis: {type: 'datetime'},
    yAxis: [{type: 'linear'}],
    legend: {enabled: series.length > 1},
  };
}

export function toMonitoringChart(data: MonitoringData): ChartKitWidget['yagr']['data'] {
  return {
    data: {
      timeline: data.timeline,
      graphs: data.series.map((s) => ({
        id: s.id,
        name: s.name,
        data: s.values,
        type: 'line' as const,
      })),
    },
    libraryConfig: {
      chart: {select: {zoom: true}},
      tooltip: {show: true, tracking: 'sticky'},
      legend: {show: false},
    },
  };
}
