import type {ChartKitWidget} from '@gravity-ui/chartkit';

import {CHART_TOKENS, SERIES_COLORS_LIGHT} from '../palette';
import {formatValue} from '../series';
import type {VizSeries} from '../types';

/** Config shape consumed by the `gravity-charts` plugin. Derived, not hand-copied. */
export type SalesChartData = ChartKitWidget['gravity-charts']['data'];

export interface SalesAdapterOptions {
  unit?: string;
}

/**
 * Maps the unified series model onto a regular line chart: one shared datetime
 * axis, one y-axis, one color per series in fixed order, legend for two or more series.
 */
export function toSalesChart(series: VizSeries[], options: SalesAdapterOptions = {}): SalesChartData {
  const {unit} = options;

  return {
    colors: [...SERIES_COLORS_LIGHT],
    legend: {enabled: series.length > 1},
    series: {
      data: series.map((s, index) => ({
        type: 'line',
        name: s.name,
        color: SERIES_COLORS_LIGHT[index],
        lineWidth: 2,
        marker: {enabled: false},
        data: s.points.map((p) => ({x: p.t, y: p.v})),
      })),
    },
    xAxis: {
      type: 'datetime',
      lineColor: CHART_TOKENS.baseline,
      labels: {style: {fontColor: CHART_TOKENS.textSecondary}},
    },
    yAxis: [
      {
        lineVisible: false,
        grid: {enabled: true},
        labels: {style: {fontColor: CHART_TOKENS.textSecondary}},
      },
    ],
    tooltip: {
      valueFormat: {
        type: 'custom',
        formatter: ({value}) => (typeof value === 'number' ? formatValue(value, unit) : '—'),
      },
    },
  };
}
