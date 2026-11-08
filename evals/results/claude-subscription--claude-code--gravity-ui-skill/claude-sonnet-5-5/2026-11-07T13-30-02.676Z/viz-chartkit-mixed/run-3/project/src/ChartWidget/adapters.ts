import type {GravityChartsWidgetData} from '@gravity-ui/chartkit/gravity-charts';
import type {YagrWidgetData} from '@gravity-ui/chartkit/yagr';

import type {MonitoringData, SalesData} from './types';

export function toGravityChartsData(sales: SalesData): GravityChartsWidgetData['data'] {
  return {
    series: {
      data: [
        {
          type: 'line',
          name: sales.name,
          data: sales.points.map(({timestamp, value}) => ({x: timestamp, y: value})),
        },
      ],
    },
    xAxis: {type: 'datetime'},
  };
}

export function toYagrData(monitoring: MonitoringData): YagrWidgetData {
  return {
    data: {
      timeline: monitoring.timeline,
      graphs: monitoring.series.map(({id, name, values}) => ({id, name, data: values})),
    },
    libraryConfig: {
      chart: {series: {type: 'line'}},
    },
  };
}
