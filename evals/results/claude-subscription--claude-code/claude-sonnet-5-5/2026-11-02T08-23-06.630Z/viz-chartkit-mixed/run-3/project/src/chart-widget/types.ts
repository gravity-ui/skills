export type ChartMode = 'sales' | 'monitoring';

/** [timestamp in ms, value]. `null` means a gap in the series. */
export type TimePoint = readonly [timestamp: number, value: number | null];

export interface TimeSeries {
  id: string;
  name: string;
  /** Explicit color; by default the widget assigns palette slots in series order. */
  color?: string;
  points: readonly TimePoint[];
}

export interface ChartDataset {
  /** Y axis title, e.g. "₽ тыс." or "мс". */
  unit?: string;
  series: readonly TimeSeries[];
}

/**
 * The single API of the widget. The same time-series model feeds both modes;
 * `mode` only selects how it is rendered (and which chart engine gets loaded).
 */
export interface ChartWidgetProps {
  title?: string;
  /** One dataset per mode. The switcher only offers the modes that have data. */
  datasets: Partial<Record<ChartMode, ChartDataset>>;
  /** Controlled mode. */
  mode?: ChartMode;
  /** Initial mode when uncontrolled. */
  defaultMode?: ChartMode;
  onModeChange?: (mode: ChartMode) => void;
  /** Chart area height in px. */
  height?: number;
}
