import type { PluginWidgetProps } from '@gravity-ui/dashkit';

export type MetricWidgetData = {
  label: string;
  value: string;
  trend: string;
};

export type ChartWidgetData = {
  title: string;
  points: Array<{ x: string; y: number }>;
};

export type StatusWidgetData = {
  services: Array<{ name: string; state: 'ok' | 'warning' | 'error' }>;
};

export type WidgetData = MetricWidgetData | ChartWidgetData | StatusWidgetData;

export type WidgetProps = PluginWidgetProps & {
  data: WidgetData;
};
