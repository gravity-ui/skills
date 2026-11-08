import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';

import {colorFor} from '../palette';
import type {TimeSeries, ValueFormatter} from '../types';

/** Чистая функция: общая модель → конфиг gravity-charts. Только type-импорты — безопасно для тестов. */
export function buildSalesConfig(
  series: readonly TimeSeries[],
  formatValue: ValueFormatter,
): ChartData {
  return {
    series: {
      data: series.map((s, i) => ({
        type: 'line' as const,
        name: s.name,
        color: colorFor(i, s.color),
        lineWidth: 2,
        data: s.points.map(([x, y]) => ({x, y})),
      })),
    },
    xAxis: {type: 'datetime', crosshair: {enabled: true}},
    // На оси допустим только декларативный формат; точные значения — в тултипе.
    yAxis: [{type: 'linear', labels: {numberFormat: {unit: 'auto', precision: 0}}}],
    legend: {enabled: series.length > 1},
    tooltip: {
      valueFormat: {type: 'custom', formatter: ({value}) => formatValue(Number(value))},
    },
  };
}
