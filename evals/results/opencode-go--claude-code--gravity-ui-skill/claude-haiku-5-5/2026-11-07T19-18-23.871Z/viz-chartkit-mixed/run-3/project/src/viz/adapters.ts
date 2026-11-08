// Чистые функции без runtime-импортов движков: модуль попадает в основной бандл,
// а тяжёлые библиотеки подтягиваются только из ленивых движков.
import type {ChartData} from '@gravity-ui/charts';
import type {YagrChartProps} from '@gravity-ui/yagr/react';

import type {VizDataset} from './types';

export type YagrThemeName = 'light' | 'dark';

/** Цвета серий для yagr — семантические токены uikit, поддерживаются yagr через CSS-переменные. */
const YAGR_SERIES_COLORS = [
  'var(--g-color-base-brand)',
  'var(--g-color-base-positive-heavy)',
  'var(--g-color-base-danger-heavy)',
  'var(--g-color-base-info-heavy)',
];

/** Режим «Продажи»: @gravity-ui/charts, datetime-ось, точки с пропусками отбрасываются. */
export function toChartsData(dataset: VizDataset): ChartData {
  return {
    xAxis: {type: 'datetime'},
    series: {
      data: dataset.series.map((serie) => ({
        type: 'line' as const,
        name: serie.name,
        data: serie.values.flatMap((y, i) => (y === null ? [] : [{x: dataset.timestamps[i], y}])),
      })),
    },
  };
}

/** Режим «Мониторинг»: @gravity-ui/yagr, общая временная шкала (мс) и значения каждой серии. */
export function toYagrConfig(dataset: VizDataset, theme: YagrThemeName): YagrChartProps['config'] {
  return {
    timeline: dataset.timestamps,
    series: dataset.series.map((serie, i) => ({
      id: serie.id,
      name: serie.name,
      type: 'line',
      color: YAGR_SERIES_COLORS[i % YAGR_SERIES_COLORS.length],
      data: serie.values,
    })),
    chart: {
      appearance: {theme, locale: 'ru'},
    },
  };
}
