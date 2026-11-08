import type {GravityChartsWidgetData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {ChartDataset, TimeSeries} from './types';

// Categorical slots 1-3 of the reference palette (validated, adjacent CVD ΔE >= 9).
// Color follows the series by its position in the dataset, not by what is visible.
const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a'];

const colorOf = (series: TimeSeries, index: number) =>
  series.color ?? PALETTE[index % PALETTE.length];

/** Regular line chart: few points, markers, Gravity Charts. */
export function toGravityChartsData(dataset: ChartDataset): GravityChartsWidgetData['data'] {
  return {
    series: {
      data: dataset.series.map((series, index) => ({
        type: 'line' as const,
        name: series.name,
        color: colorOf(series, index),
        lineWidth: 2,
        data: series.points.map(([x, y]) => ({x, y})),
      })),
    },
    xAxis: {type: 'datetime'},
    yAxis: [{title: {text: dataset.unit}}],
    legend: {enabled: dataset.series.length > 1},
  };
}

/** Dense monitoring chart: Yagr (uPlot) on a shared, sorted timeline. */
export function toYagrData(dataset: ChartDataset): YagrWidgetData {
  const timeline = [
    ...new Set(dataset.series.flatMap((series) => series.points.map(([ts]) => ts))),
  ].sort((a, b) => a - b);
  const index = new Map(timeline.map((ts, i) => [ts, i]));

  const graphs = dataset.series.map((series, i) => {
    const data: (number | null)[] = new Array(timeline.length).fill(null);
    for (const [ts, value] of series.points) {
      data[index.get(ts)!] = value;
    }
    return {
      id: series.id,
      name: series.name,
      color: colorOf(series, i),
      data,
      lineWidth: 1.5,
    };
  });

  return {
    data: {graphs, timeline},
    libraryConfig: {
      axes: {y: {label: dataset.unit}},
      legend: {show: dataset.series.length > 1},
    },
  };
}
