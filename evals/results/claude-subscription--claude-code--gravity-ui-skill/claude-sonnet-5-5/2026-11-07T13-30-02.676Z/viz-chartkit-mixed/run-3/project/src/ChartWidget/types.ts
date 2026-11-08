export type ChartWidgetMode = 'sales' | 'monitoring';

/** Regular business series: one point per period. */
export type SalesPoint = {
  /** Timestamp, ms */
  timestamp: number;
  value: number;
};

export type SalesData = {
  /** Series name shown in legend and tooltip */
  name: string;
  points: SalesPoint[];
};

/** Dense monitoring series: all series share one timeline, `null` is a gap. */
export type MonitoringSeries = {
  id: string;
  name: string;
  values: (number | null)[];
};

export type MonitoringData = {
  /** Timestamps, ms. Same length as every `values` array */
  timeline: number[];
  series: MonitoringSeries[];
};

/** Single public API of the widget, shared by both modes. */
export type ChartWidgetProps = {
  title?: string;
  /** Controlled mode */
  mode?: ChartWidgetMode;
  /** Initial mode when uncontrolled */
  defaultMode?: ChartWidgetMode;
  onModeChange?: (mode: ChartWidgetMode) => void;
  /** Data for the `sales` mode */
  sales: SalesData;
  /** Data for the `monitoring` mode */
  monitoring: MonitoringData;
  /** Chart area height, px */
  height?: number;
};
