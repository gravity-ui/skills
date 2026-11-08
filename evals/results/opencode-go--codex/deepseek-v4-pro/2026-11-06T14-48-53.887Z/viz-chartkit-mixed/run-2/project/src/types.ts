export interface ChartDataPoint {
  timestamp: number;
  value: number;
  label?: string;
}

export type ChartMode = 'sales' | 'monitoring';

export interface ChartWidgetProps {
  data: ChartDataPoint[];
  mode?: ChartMode;
  title?: string;
  height?: number;
}

export interface ChartEngineProps {
  data: ChartDataPoint[];
  width: number;
  height: number;
  title?: string;
}
