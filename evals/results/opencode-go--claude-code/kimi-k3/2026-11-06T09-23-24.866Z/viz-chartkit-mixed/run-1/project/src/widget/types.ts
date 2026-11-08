/**
 * Unified widget API.
 *
 * Both visualization modes (sales line chart, dense monitoring time series)
 * are driven through these very types: the widget owns mode switching and
 * chrome, while the concrete chart engines are interchangeable components
 * implementing `ChartEngineProps` and are lazy-loaded per mode.
 */

export type ChartMode = 'sales' | 'monitoring';

export interface TimeSeriesPoint {
  /** Epoch milliseconds. */
  t: number;
  v: number;
}

export interface ChartSeries {
  id: string;
  /** Untrusted data — always rendered as text, never HTML. */
  name: string;
  points: TimeSeriesPoint[];
}

/**
 * The contract every chart engine implements. An engine is a React component
 * that accepts exactly these props, so the widget can swap engines without
 * changing how the caller talks to it.
 */
export interface ChartEngineProps {
  series: ChartSeries[];
  /** Chart block height in px. */
  height?: number;
  /** Full value formatting (tooltips, direct labels, table). */
  formatValue: (v: number) => string;
  /** X-axis timestamp formatting. */
  formatTime: (t: number) => string;
  /** Compact value formatting for axis ticks. Defaults to `formatValue`. */
  formatAxis?: (v: number) => string;
  /** Compact time formatting for axis ticks. Defaults to `formatTime`. */
  formatTimeAxis?: (t: number) => string;
}

/** Public widget props — the single API surface for both modes. */
export interface ChartWidgetProps {
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  series: ChartSeries[];
  height?: number;
  /** Defaults come from per-mode metadata; every formatter is overridable. */
  title?: string;
  formatValue?: (v: number) => string;
  formatTime?: (t: number) => string;
  formatAxis?: (v: number) => string;
  formatTimeAxis?: (t: number) => string;
}
