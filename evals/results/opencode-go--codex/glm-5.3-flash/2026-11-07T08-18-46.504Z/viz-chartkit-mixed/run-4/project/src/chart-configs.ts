import type {ChartData} from '@gravity-ui/charts';
import {salesData, monitoringData} from './chart-data';
import type {SalesPoint, MonitoringPoint} from './chart-data';

type GravityChartsWidgetData = {
  data: ChartData;
};

type YagrWidgetData = {
  data: {
    graphs: {
      id: string;
      name: string;
      type: 'line';
      data: Array<number | null>;
    }[];
    timeline: number[];
  };
  libraryConfig: {
    title: {
      text: string;
    };
  };
};

export function createSalesChartConfig(): GravityChartsWidgetData {
  const series = [
    {
      type: 'line' as const,
      name: 'Выручка, ₽',
      data: salesData.map((point: SalesPoint) => ({
        x: point.date,
        y: point.revenue,
      })),
    },
    {
      type: 'line' as const,
      name: 'Заказы',
      yAxis: 1,
      data: salesData.map((point: SalesPoint) => ({
        x: point.date,
        y: point.orders,
      })),
    },
  ];

  return {
    data: {
      title: {text: 'Продажи по месяцам'},
      series: {data: series},
      xAxis: {
        type: 'category',
        labels: {rotation: -45},
      },
      yAxis: [
        {
          title: {text: 'Выручка, ₽'},
        },
        {
          position: 'right',
          title: {text: 'Заказы'},
          grid: {enabled: false},
        },
      ],
      tooltip: {
        valueFormat: {type: 'number'},
      },
    },
  };
}

export function createMonitoringChartConfig(): YagrWidgetData {
  const timeline = monitoringData.map((point: MonitoringPoint) => point.timestamp);

  return {
    data: {
      timeline,
      graphs: [
        {
          id: 'cpu',
          name: 'CPU, %',
          type: 'line',
          data: monitoringData.map((point: MonitoringPoint) => point.cpu),
        },
        {
          id: 'memory',
          name: 'Память, %',
          type: 'line',
          data: monitoringData.map((point: MonitoringPoint) => point.memory),
        },
        {
          id: 'latency',
          name: 'Latency, мс',
          type: 'line',
          data: monitoringData.map((point: MonitoringPoint) => point.latency),
        },
      ],
    },
    libraryConfig: {
      title: {
        text: 'Мониторинг сервиса',
      },
    },
  };
}
