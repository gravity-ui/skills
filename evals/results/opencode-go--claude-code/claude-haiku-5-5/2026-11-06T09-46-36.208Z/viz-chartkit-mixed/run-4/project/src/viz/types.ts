/**
 * Public contract of the visualization widget.
 *
 * The same `VizWidgetProps` drive both modes. Consumers describe the data once
 * (as time-stamped series); the widget picks the engine and converts the data
 * into that engine's config internally. Nothing engine-specific leaks out.
 */

/** `sales` — regular line chart (gravity-charts). `monitoring` — dense time series (yagr / uPlot). */
export type VizMode = 'sales' | 'monitoring';

export interface VizPoint {
  /** Timestamp in epoch milliseconds. */
  t: number;
  /** Value; `null` marks a gap (no sample), not zero. */
  v: number | null;
}

export interface VizSeries {
  /** Stable identity of the entity. Colors are assigned by position, so keep the order stable. */
  id: string;
  /** Human-readable name. Treated as untrusted text (rendered as text, never as HTML). */
  name: string;
  points: VizPoint[];
}

export interface VizWidgetProps {
  title: string;
  series: VizSeries[];
  /** Unit suffix appended to formatted values, e.g. "₽". */
  unit?: string;
  /** Controlled mode. When omitted the widget manages the mode itself. */
  mode?: VizMode;
  /** Initial mode for the uncontrolled case. Defaults to `sales`. */
  defaultMode?: VizMode;
  onModeChange?: (mode: VizMode) => void;
  /** Height of the chart area in px. The container gets an explicit height, as chartkit requires. */
  height?: number;
}
