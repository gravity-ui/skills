import type {ChartData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import {SERIES_COLORS, seriesColor} from './palette';
import type {MonitoringData, SalesData} from './types';

/**
 * Адаптеры единого формата данных виджета в форматы движков.
 * Импорты типов — type-only, поэтому сами движки сюда не попадают
 * и продолжают загружаться лениво через React.lazy-плагины ChartKit.
 */

/**
 * `sales` → декларативный конфиг `@gravity-ui/charts` (линейный график).
 * Плагин gravity-charts принимает `ChartData` напрямую (без обёртки).
 */
export function toGravityChartsData(data: SalesData): ChartData {
  return {
    colors: [...SERIES_COLORS],
    legend: {enabled: true},
    series: {
      data: data.series.map((series, index) => ({
        type: 'line' as const,
        name: series.name,
        color: seriesColor(index),
        lineWidth: 2,
        data: series.points.map((point) => ({x: point.date, y: point.value})),
      })),
    },
    xAxis: {
      type: 'datetime',
    },
    yAxis: [
      {
        title: data.valueAxisTitle ? {text: data.valueAxisTitle} : undefined,
      },
    ],
  };
}

/**
 * `monitoring` → конфиг `@gravity-ui/yagr` (uPlot, canvas).
 * Timeline в миллисекундах — дефолтный `chart.timeMultiplier = 1` у yagr.
 */
export function toYagrData(data: MonitoringData): YagrWidgetData {
  return {
    data: {
      timeline: data.timeline,
      timeZone: data.timeZone,
      graphs: data.series.map((series, index) => ({
        id: series.name,
        name: series.name,
        type: 'line' as const,
        width: 2,
        color: seriesColor(index),
        data: series.values,
      })),
    },
    libraryConfig: {
      legend: {show: true},
      tooltip: {show: true},
      axes: data.valueAxisTitle ? {y: {label: data.valueAxisTitle}} : undefined,
    },
  };
}
