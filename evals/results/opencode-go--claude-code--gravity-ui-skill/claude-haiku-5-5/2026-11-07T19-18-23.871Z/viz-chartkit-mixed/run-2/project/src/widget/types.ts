/**
 * Public API of the visualization widget.
 *
 * Both modes consume the same `series` model and the same props, so a consumer
 * never needs to know which rendering engine is behind a given mode.
 */

/** `sales` — regular line chart; `monitoring` — dense time-series view. */
export type WidgetMode = 'sales' | 'monitoring';

/** Single sample. `t` is epoch milliseconds, `v` is `null` for a gap. */
export interface TimeSeriesPoint {
    t: number;
    v: number | null;
}

export interface TimeSeries {
    id: string;
    name: string;
    color?: string;
    /** Sorted by `t` ascending. */
    points: TimeSeriesPoint[];
}

/**
 * Data for every mode, in the same shape. The sales dataset is typically daily,
 * the monitoring dataset dense; the contract is identical either way.
 */
export type WidgetData = Record<WidgetMode, TimeSeries[]>;

/** Resolved light/dark theme passed to engines that need it explicitly. */
export type WidgetTheme = 'light' | 'dark';

/** Props every rendering engine receives. Identical for all modes. */
export interface EngineProps {
    series: TimeSeries[];
    height: number;
    theme: WidgetTheme;
}

export interface VisualizationWidgetProps {
    title: string;
    data: WidgetData;
    /** Controlled mode. When omitted, the widget manages its own mode. */
    mode?: WidgetMode;
    /** Initial mode for the uncontrolled case. @default 'sales' */
    defaultMode?: WidgetMode;
    onModeChange?: (mode: WidgetMode) => void;
    /** Plot height in CSS pixels. @default 360 */
    height?: number;
    className?: string;
}
