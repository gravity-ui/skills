import type {ThemeType} from '@gravity-ui/uikit';

/**
 * Visualization modes.
 * - `sales`: regular linear sales chart (`@gravity-ui/charts`).
 * - `monitoring`: dense time series for monitoring (`@gravity-ui/yagr`).
 */
export type VisualizationMode = 'sales' | 'monitoring';

/** One sample. `t` is epoch milliseconds; `v` is `null` for a missing reading (gap). */
export interface SeriesPoint {
    t: number;
    v: number | null;
}

export interface WidgetSeries {
    id: string;
    name: string;
    points: SeriesPoint[];
}

/** The single public API of the widget, identical for both modes. */
export interface VisualizationWidgetProps {
    title: string;
    series: WidgetSeries[];
    /** Controlled mode. Omit it to let the widget keep its own mode. */
    mode?: VisualizationMode;
    /** Initial mode when uncontrolled. Defaults to `sales`. */
    defaultMode?: VisualizationMode;
    onModeChange?: (mode: VisualizationMode) => void;
    /** Height of the chart area in px. Defaults to 360. */
    height?: number;
}

/**
 * Contract every engine module satisfies. The widget only sees this shape,
 * so engines stay interchangeable and never import each other.
 */
export interface EngineProps {
    series: WidgetSeries[];
    /** Categorical colors, already resolved for the current theme (fixed order). */
    colors: readonly string[];
    theme: ThemeType;
}
