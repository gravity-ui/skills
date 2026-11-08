import type {ChartData} from '@gravity-ui/charts';
import type {RawSerieData, YagrChartOptions} from '@gravity-ui/yagr';

import {salesMetrics, type SalesPoint} from './salesData';
import {monitoringMetrics, monitoringTimeline} from './monitoringData';

export interface MonitoringConfig {
  timeMultiplier: YagrChartOptions['timeMultiplier'];
  tooltipTitleFormat: string;
  yScaleMin: number;
  yScaleMax: number;
}

export const monitoringConfig: MonitoringConfig = {
  timeMultiplier: 1,
  tooltipTitleFormat: 'HH:mm:ss',
  yScaleMin: 0,
  yScaleMax: 100,
};

type SalesSeriesData = Extract<ChartData['series']['data'][number], {type: 'line'}>['data'];

function createSalesPoint(
  point: SalesPoint,
  seriesIndex: number,
): SalesSeriesData[number] {
  return {
    x: point.timestamp,
    y: point.value,
    custom: {seriesIndex},
  };
}

export function getSalesChartData(): ChartData {
  return {
    xAxis: {
      type: 'datetime',
      title: {
        text: 'Time',
        style: {
          fontSize: 'var(--g-text-caption-1-font-size)',
          fontColor: 'var(--g-color-text-secondary)',
        },
      },
    },
    yAxis: [
      {
        title: {
          text: 'Sales, units',
          style: {
            fontSize: 'var(--g-text-caption-1-font-size)',
            fontColor: 'var(--g-color-text-secondary)',
          },
        },
      },
    ],
    series: {
      data: salesMetrics.map((metric, seriesIndex) => ({
        id: metric.id,
        name: metric.name,
        type: 'line' as const,
        color: metric.color,
        data: metric.points.map((point) =>
          createSalesPoint(point, seriesIndex),
        ),
      })),
    },
    tooltip: {
      valueFormat: {
        type: 'custom',
        formatter: ({value}) => {
          const metricValue = Number(value);

          return Number.isFinite(metricValue)
            ? `${metricValue.toFixed(1)} units`
            : String(value);
        },
      },
      headerFormat: {type: 'date', format: 'DD MMM HH:mm'},
    },
  };
}

export function getMonitoringGraphs(): RawSerieData[] {
  return monitoringMetrics.map((metric) => ({
    id: metric.id,
    name: metric.name,
    type: 'line' as const,
    color: metric.color,
    data: metric.values,
    width: 1,
  }));
}

export function getMonitoringWidgetData() {
  return {
    data: {
      graphs: getMonitoringGraphs(),
      timeline: monitoringTimeline,
      timeZone: 'UTC',
    },
    libraryConfig: {
      chart: {
        appearance: {
          theme: 'light' as const,
          locale: 'en' as const,
        },
      },
      legend: {
        show: true,
        position: 'bottom' as const,
        fontSize: 12,
        behaviour: 'basic' as const,
      },
      scales: {
        y: {
          min: monitoringConfig.yScaleMin,
          max: monitoringConfig.yScaleMax,
        },
      },
      tooltip: {
        show: true,
        tracking: 'sticky' as const,
        precision: 2,
        title: monitoringConfig.tooltipTitleFormat,
      },
    },
  };
}
