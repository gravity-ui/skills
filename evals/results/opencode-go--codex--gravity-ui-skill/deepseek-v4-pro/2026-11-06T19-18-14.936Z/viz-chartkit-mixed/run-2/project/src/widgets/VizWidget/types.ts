export type VizMode = 'sales-line' | 'monitor-dense';

export interface SalesPoint {
  x: number;
  y: number;
}

export interface MonitorSeries {
  id: string;
  name: string;
  color: string;
  data: number[];
}

export interface VizWidgetProps {
  mode: VizMode;
  onModeChange: (mode: VizMode) => void;
  height?: number;
  title?: string;
  salesData?: SalesPoint[];
  monitorData?: {
    timeline: number[];
    series: MonitorSeries[];
  };
}
