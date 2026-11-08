export type ChartMode = 'sales' | 'monitoring';

export type ChartTheme = 'light' | 'dark';

/** One sample. `x` is epoch milliseconds, `y` is a finite number. Points must be sorted by `x`. */
export interface ChartPoint {
    x: number;
    y: number;
}

export interface ChartSeries {
    id: string;
    name: string;
    points: ChartPoint[];
}

/** Everything one mode needs to draw. Both modes share this shape. */
export interface ChartDataset {
    /** Unit shown on values, e.g. "₽" or "мс". */
    unit: string;
    series: ChartSeries[];
}

export type FormatValue = (value: number, unit: string) => string;

/**
 * Props every chart engine receives. Identical for both modes, so an engine
 * is an interchangeable implementation behind the widget's contract.
 */
export interface EngineProps {
    /** Already capped to MAX_SERIES. */
    series: ChartSeries[];
    /** One color per series, same order as `series`. */
    colors: string[];
    theme: ChartTheme;
    /** Full box height in px, x-axis labels included. */
    height: number;
    /** Unit for axis labels, which some engines format natively. */
    unit: string;
    /** Unit is already bound. Used for tooltips and the table. */
    formatValue: (value: number) => string;
    ariaLabel: string;
}

export interface ChartWidgetProps {
    title: string;
    datasets: Record<ChartMode, ChartDataset>;
    /** Controlled mode. Omit to let the widget own the state. */
    mode?: ChartMode;
    /** Initial mode when uncontrolled. Defaults to 'sales'. */
    defaultMode?: ChartMode;
    onModeChange?: (mode: ChartMode) => void;
    /** Full box height in px, x-axis labels included. Defaults to 360. */
    height?: number;
    formatValue?: FormatValue;
    /** Keeps the current render visible at reduced opacity while new data loads. */
    refreshing?: boolean;
}
