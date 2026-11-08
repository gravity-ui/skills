import type {KpiMetricId} from './mockData';

// Widget type ids are stored in the saved layout — do not rename them.
export const WIDGET_TYPES = {
  kpi: 'kpi',
  chart: 'chart',
  activity: 'activity',
} as const;

export interface KpiWidgetData {
  metric: KpiMetricId;
}
