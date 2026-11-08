export type VizMode = 'sales' | 'monitoring';

/** [timestamp in ms, value]. `null` value = gap in the series. */
export type TimePoint = readonly [timestamp: number, value: number | null];

export interface TimeSeries {
  id: string;
  name: string;
  points: readonly TimePoint[];
}

export interface SalesMonitoringWidgetProps {
  /** Per-mode data. Both modes share one data shape, the widget adapts it to the right engine. */
  series: Record<VizMode, readonly TimeSeries[]>;
  /** Controlled mode. */
  mode?: VizMode;
  /** Initial mode when uncontrolled. Defaults to `sales`. */
  defaultMode?: VizMode;
  onModeChange?: (mode: VizMode) => void;
  /** Chart height in px. ChartKit fills its parent, so the height must be explicit. */
  height?: number;
  /** Optional Y axis title per mode. */
  yAxisTitle?: Partial<Record<VizMode, string>>;
}
