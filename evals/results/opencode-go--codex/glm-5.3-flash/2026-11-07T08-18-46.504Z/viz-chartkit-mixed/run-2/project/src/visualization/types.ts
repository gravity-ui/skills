export type VisualizationMode = 'sales' | 'monitoring';

export type SalesPoint = {
  date: string;
  revenue: number;
  orders: number;
};

export type MonitoringPoint = {
  timestamp: number;
  responseTimeMs: number;
  cpuLoad: number;
};

export type VisualizationData = {
  sales: SalesPoint[];
  monitoring: MonitoringPoint[];
};

export type VisualizationWidgetProps = {
  mode: VisualizationMode;
  data: VisualizationData;
  className?: string;
};
