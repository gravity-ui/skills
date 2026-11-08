import {MAX_SERIES, type PaletteTheme, getSeriesColor} from './palette';
import type {
  ChartKitConfig,
  ChartWidgetData,
  ChartWidgetMode,
  MonitoringData,
  SalesData,
} from './types';

function assertSeriesCount(count: number) {
  if (count > MAX_SERIES) {
    throw new Error(`ChartWidget supports at most ${MAX_SERIES} series, got ${count}`);
  }
}

export function buildSalesConfig(sales: SalesData, theme: PaletteTheme): ChartKitConfig {
  assertSeriesCount(sales.series.length);

  return {
    type: 'gravity-charts',
    data: {
      series: {
        data: sales.series.map((serie, index) => ({
          type: 'line',
          name: serie.name,
          color: getSeriesColor(theme, index),
          lineWidth: 2,
          marker: {enabled: true, radius: 4},
          data: serie.points.map(({timestamp, value}) => ({x: timestamp, y: value})),
        })),
      },
      xAxis: {type: 'datetime'},
      yAxis: [{min: 0}],
      legend: {enabled: sales.series.length > 1},
      tooltip: {
        valueFormat: {
          type: 'number',
          precision: 0,
          showRankDelimiter: true,
          postfix: sales.valueSuffix,
        },
      },
    },
  };
}

export function buildMonitoringConfig(
  monitoring: MonitoringData,
  theme: PaletteTheme,
): ChartKitConfig {
  assertSeriesCount(monitoring.series.length);

  const {timeline, series, unit, timeZone} = monitoring;
  series.forEach((serie) => {
    if (serie.values.length !== timeline.length) {
      throw new Error(
        `Series "${serie.name}" has ${serie.values.length} values for ${timeline.length} timestamps`,
      );
    }
  });
  const formatValue = (value: string | number | null) => {
    if (typeof value !== 'number') {
      return '—';
    }
    return unit ? `${value.toFixed(1)} ${unit}` : value.toFixed(1);
  };

  return {
    type: 'yagr',
    data: {
      data: {
        timeline,
        timeZone,
        graphs: series.map((serie, index) => ({
          id: `serie-${index}`,
          name: serie.name,
          color: getSeriesColor(theme, index),
          data: serie.values,
        })),
      },
      libraryConfig: {
        chart: {
          series: {type: 'line', width: 1.5, spanGaps: false},
          select: {zoom: true},
          timeMultiplier: 1,
        },
        axes: {y: {label: unit}},
        scales: {y: {min: 0}},
        legend: {show: series.length > 1, position: 'bottom'},
        tooltip: {show: true, tracking: 'sticky', value: formatValue},
      },
    },
  };
}

/** Single entry point: the mode picks the engine, the caller never deals with either API. */
export function buildChartConfig(
  mode: ChartWidgetMode,
  data: ChartWidgetData,
  theme: PaletteTheme,
): ChartKitConfig {
  switch (mode) {
    case 'sales':
      return buildSalesConfig(data.sales, theme);
    case 'monitoring':
      return buildMonitoringConfig(data.monitoring, theme);
  }
}
