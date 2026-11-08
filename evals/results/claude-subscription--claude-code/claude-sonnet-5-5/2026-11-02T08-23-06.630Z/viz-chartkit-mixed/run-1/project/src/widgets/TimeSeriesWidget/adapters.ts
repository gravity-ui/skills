import type {ChartData} from '@gravity-ui/charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {getSeriesColor} from './palette';
import type {ThemeName, TimeSeriesData} from './types';

// Здесь только типы движков (import type стирается при сборке), поэтому модуль
// не тянет код графических библиотек в основной бандл.

function assertAligned(data: TimeSeriesData) {
  for (const s of data.series) {
    if (s.values.length !== data.timeline.length) {
      throw new Error(
        `Серия «${s.name}»: ${s.values.length} значений на ${data.timeline.length} меток времени`,
      );
    }
  }
}

const numberFormat = new Intl.NumberFormat('ru-RU', {maximumFractionDigits: 1});
const formatValue = (value: number, unit?: string) =>
  `${numberFormat.format(value)}${unit ? ` ${unit}` : ''}`;

/** Обычный линейный график (gravity-charts): умеренное число точек, маркеры, легенда. */
export function toGravityChartsData(data: TimeSeriesData, theme: ThemeName): ChartData {
  assertAligned(data);
  return {
    series: {
      data: data.series.map((s, i) => ({
        type: 'line' as const,
        id: s.id,
        name: s.name,
        color: getSeriesColor(theme, i),
        lineWidth: 2,
        data: data.timeline.flatMap((x, idx) => {
          const y = s.values[idx];
          return y === null ? [] : [{x, y}];
        }),
      })),
    },
    xAxis: {type: 'datetime'},
    yAxis: [{title: {text: data.unit}}],
    legend: {enabled: data.series.length > 1},
  };
}

/** Плотный временной ряд (Yagr/uPlot): тысячи точек, canvas, маркеры только под курсором. */
export function toYagrData(data: TimeSeriesData, theme: ThemeName): YagrWidgetData {
  assertAligned(data);
  return {
    data: {
      timeline: data.timeline,
      graphs: data.series.map((s, i) => ({
        id: s.id,
        name: s.name,
        data: s.values,
        color: getSeriesColor(theme, i),
        type: 'line' as const,
        width: 1.5,
      })),
    },
    libraryConfig: {
      chart: {series: {type: 'line', spanGaps: false}},
      axes: {
        y: {values: (_u, ticks) => ticks.map((t) => formatValue(t, data.unit))},
      },
      legend: {show: data.series.length > 1},
      markers: {show: false},
      scales: {y: {type: 'linear', range: 'nice'}},
    },
  };
}
