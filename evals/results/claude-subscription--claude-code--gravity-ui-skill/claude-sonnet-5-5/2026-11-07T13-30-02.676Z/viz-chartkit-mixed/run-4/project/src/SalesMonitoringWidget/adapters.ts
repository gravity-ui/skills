import type {ChartKitProps} from '@gravity-ui/chartkit';

import type {TimeSeries} from './types';

type SalesData = ChartKitProps<'gravity-charts'>['data'];
type MonitoringData = ChartKitProps<'yagr'>['data'];

/** Regular line chart (gravity-charts): one `{x, y}` point list per series. */
export function toSalesChartData(series: readonly TimeSeries[], yTitle?: string): SalesData {
  return {
    series: {
      data: series.map((s) => ({
        type: 'line' as const,
        name: s.name,
        data: s.points.map(([x, y]) => ({x, y})),
      })),
    },
    xAxis: {type: 'datetime'},
    yAxis: [{title: yTitle ? {text: yTitle} : undefined}],
  };
}

/**
 * Dense time series (yagr): one shared, sorted timeline + value arrays aligned to it.
 * Series with different timestamps are merged onto the union timeline, missing points are `null`.
 */
export function toMonitoringData(series: readonly TimeSeries[], yTitle?: string): MonitoringData {
  const stamps = new Set<number>();
  for (const s of series) {
    for (const [t] of s.points) {
      stamps.add(t);
    }
  }
  const timeline = Array.from(stamps).sort((a, b) => a - b);

  const graphs = series.map((s) => {
    const byTime = new Map<number, number | null>(s.points);
    return {
      id: s.id,
      name: s.name,
      data: timeline.map((t) => byTime.get(t) ?? null),
    };
  });

  return {
    data: {graphs, timeline},
    libraryConfig: {
      chart: {series: {type: 'line'}},
      axes: yTitle ? {y: {label: yTitle}} : undefined,
    },
  };
}
