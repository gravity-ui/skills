import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {alignSeries} from '../adapters';
import {colorFor} from '../palette';
import type {TimeSeries, ValueFormatter} from '../types';

/** Чистая функция: общая модель → конфиг Yagr (canvas, плотные ряды). */
export function buildMonitoringConfig(
  series: readonly TimeSeries[],
  formatValue: ValueFormatter,
): YagrWidgetData {
  const {timeline, columns} = alignSeries(series);
  return {
    data: {
      timeline,
      graphs: series.map((s, i) => ({
        id: s.id,
        name: s.name,
        color: colorFor(i, s.color),
        lineWidth: 1.5,
        data: columns[i],
      })),
    },
    libraryConfig: {
      chart: {select: {zoom: true}},
      axes: {
        y: {values: (_u, ticks) => ticks.map((t) => formatValue(t))},
      },
      cursor: {markersSize: 6},
      legend: {show: series.length > 1},
      tooltip: {
        show: true,
        tracking: 'sticky',
        value: (v) => (v === null || v === undefined ? '—' : formatValue(Number(v))),
      },
    },
  };
}
