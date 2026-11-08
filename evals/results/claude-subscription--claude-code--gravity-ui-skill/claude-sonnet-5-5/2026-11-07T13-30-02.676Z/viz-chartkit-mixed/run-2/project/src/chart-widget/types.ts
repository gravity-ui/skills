export type ChartWidgetMode = 'sales' | 'monitoring';

/** Regular series: a handful of points, e.g. daily sales. `x` is a Unix timestamp in ms. */
export type SalesSeries = {
  id: string;
  name: string;
  points: Array<{x: number; y: number}>;
};

/** Dense series: thousands of points over a shared timeline (Unix timestamps in ms). */
export type MonitoringData = {
  timeline: number[];
  series: Array<{id: string; name: string; values: Array<number | null>}>;
};

export type ChartWidgetData = {
  sales: SalesSeries[];
  monitoring: MonitoringData;
};

/** Single public API of the widget; both modes are driven by the same props. */
export type ChartWidgetProps = {
  title?: string;
  data: ChartWidgetData;
  /** Controlled mode. */
  mode?: ChartWidgetMode;
  /** Initial mode when uncontrolled. */
  defaultMode?: ChartWidgetMode;
  onModeChange?: (mode: ChartWidgetMode) => void;
  /** Chart area height in px. */
  height?: number;
};
