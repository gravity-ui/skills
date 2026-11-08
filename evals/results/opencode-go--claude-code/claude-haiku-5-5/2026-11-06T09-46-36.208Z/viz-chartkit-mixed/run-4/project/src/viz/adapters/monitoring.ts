import type {ChartKitWidget} from '@gravity-ui/chartkit';

import {SERIES_COLORS_LIGHT} from '../palette';
import {buildTimeline, formatValue} from '../series';
import type {VizSeries} from '../types';

/** Config shape consumed by the `yagr` plugin. Derived, not hand-copied. */
export type MonitoringChartData = ChartKitWidget['yagr']['data'];

export interface MonitoringAdapterOptions {
  unit?: string;
}

/**
 * Maps the unified series model onto yagr (uPlot-based, canvas). yagr wants one
 * shared timeline, so every series is aligned to the union of all timestamps and
 * missing samples become `null` — a gap, not a zero.
 *
 * `timeMultiplier: 1` declares that timestamps are epoch milliseconds, the same unit
 * the sales mode uses, so one `VizPoint.t` works for both engines.
 */
export function toMonitoringChart(series: VizSeries[], options: MonitoringAdapterOptions = {}): MonitoringChartData {
  const {unit} = options;
  const timeline = buildTimeline(series);

  return {
    data: {
      timeline,
      graphs: series.map((s, index) => {
        const valueAt = new Map<number, number | null>();
        for (const p of s.points) {
          valueAt.set(p.t, p.v);
        }
        return {
          id: s.id,
          name: s.name,
          type: 'line',
          color: SERIES_COLORS_LIGHT[index],
          data: timeline.map((t) => valueAt.get(t) ?? null),
        };
      }),
    },
    libraryConfig: {
      chart: {
        timeMultiplier: 1,
        appearance: {theme: 'light'},
      },
      title: {text: ''},
      legend: {show: series.length > 1},
      tooltip: {
        show: true,
        value: (value: string | number | null) => (typeof value === 'number' ? formatValue(value, unit) : '—'),
      },
    },
  };
}
