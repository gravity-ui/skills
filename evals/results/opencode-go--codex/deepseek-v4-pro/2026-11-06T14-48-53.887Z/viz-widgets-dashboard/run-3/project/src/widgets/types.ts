export interface WidgetDef {
  id: string;
  title: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
  kind: WidgetKind;
  data: MetricProps | ChartProps | ListProps | ProgressProps | TextProps;
}

export type WidgetKind =
  | 'metric'
  | 'chart'
  | 'list'
  | 'progress'
  | 'text';

export interface MetricProps {
  value: string;
  label: string;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string;
}

export interface ChartProps {
  bars: { label: string; value: number; color?: string }[];
}

export interface ListItem {
  label: string;
  value: string;
}

export interface ListProps {
  items: ListItem[];
}

export interface ProgressItem {
  label: string;
  current: number;
  total: number;
}

export interface ProgressProps {
  items: ProgressItem[];
}

export interface TextProps {
  body: string;
}
