/**
 * Unified data contract of the visualization widget.
 *
 * Both chart engines (a regular line chart and a dense monitoring time series)
 * consume the same `VizSeriesData` shape: one shared ascending timeline plus
 * columnar values per series. Adapters in `adapters.ts` convert it to the
 * engine-specific config, so widget consumers never touch engine APIs.
 */

/** Which chart engine renders a view. Engines are loaded lazily on first use. */
export type VizEngine = 'line' | 'timeseries';

export interface VizSeries {
    id: string;
    name: string;
    /** Values aligned with `VizSeriesData.timeline`; `null` marks a gap. */
    values: Array<number | null>;
}

export interface VizSeriesData {
    /** Unix timestamps in milliseconds, ascending, shared by every series. */
    timeline: number[];
    series: VizSeries[];
}

export interface VizValueFormat {
    /** Fixed number of decimals (default 0). */
    precision?: number;
    /** Text appended to a formatted value, e.g. ` rps`. */
    postfix?: string;
}

export interface VizView {
    id: string;
    /** Label shown in the mode switcher. */
    label: string;
    engine: VizEngine;
    data: VizSeriesData;
    /** Caption rendered under the widget title while this view is active. */
    description?: string;
    valueFormat?: VizValueFormat;
    /** Day.js format for the X axis labels of the `line` engine (default `DD MMM`). */
    dateFormat?: string;
}

export interface VizWidgetProps {
    title: string;
    /** Views to switch between; at least one is required. */
    views: VizView[];
    /** Controlled active view id. */
    activeViewId?: string;
    /** Initial view id for uncontrolled usage (defaults to the first view). */
    defaultViewId?: string;
    onViewChange?: (viewId: string) => void;
    /** Chart area height in pixels (default 320). */
    chartHeight?: number;
    /** Render the per-series summary table under the chart (default true). */
    showSummary?: boolean;
    className?: string;
}
