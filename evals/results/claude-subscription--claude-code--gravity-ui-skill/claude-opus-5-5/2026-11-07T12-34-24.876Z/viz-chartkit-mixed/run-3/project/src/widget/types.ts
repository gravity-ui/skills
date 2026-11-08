/**
 * Unified, engine-agnostic API of the visualization widget.
 *
 * A consumer describes *what* to show (timestamps + series of values) and picks a
 * rendering engine per view. The widget maps the same data shape onto the chosen
 * ChartKit plugin, so switching engines never changes the consumer's contract.
 */

/**
 * - `line` — a regular declarative line chart (`@gravity-ui/charts` via the
 *   ChartKit `gravity-charts` plugin). Good for business data: tens–hundreds of points.
 * - `timeseries` — a dense, canvas-based time series (`@gravity-ui/yagr` via the
 *   ChartKit `yagr` plugin). Good for monitoring: thousands of points per series.
 */
export type VisualizationEngine = 'line' | 'timeseries';

export interface VisualizationSeries {
    /** Stable id: keeps a series' color and identity across re-renders. */
    id: string;
    /** Name shown in the legend and the tooltip. */
    name: string;
    /** One value per timestamp; `null` marks a gap. Length must equal `timestamps.length`. */
    values: Array<number | null>;
}

export interface VisualizationDataset {
    /** Unix timestamps in milliseconds, ascending. Shared by all series. */
    timestamps: number[];
    series: VisualizationSeries[];
}

export interface VisualizationView<Id extends string = string> {
    id: Id;
    /** Label of the switcher option. */
    label: string;
    engine: VisualizationEngine;
    data: VisualizationDataset;
    /** Y axis caption with units, e.g. "Выручка, тыс. ₽". */
    yAxisTitle?: string;
    /** Decimal places for values in axis labels and the tooltip. */
    precision?: number;
}

export interface VisualizationWidgetProps<Id extends string = string> {
    title: string;
    description?: string;
    /** Views available in the switcher. At least one is required. */
    views: ReadonlyArray<VisualizationView<Id>>;
    /** Controlled active view id. */
    view?: Id;
    /** Initial view for the uncontrolled mode. Defaults to the first view. */
    defaultView?: Id;
    onViewChange?: (id: Id) => void;
    /** Height of the plot area in px. */
    height?: number;
    /** Called when the chart engine fails to load or render. */
    onError?: (error: unknown) => void;
    className?: string;
}
