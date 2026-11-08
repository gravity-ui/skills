/**
 * Unified public API of the visualization widget.
 *
 * A single component (`VizWidget`) renders both modes. The `mode` field of a
 * discriminated union selects the chart engine under the hood:
 * - `sales`      — regular business line chart, rendered by @gravity-ui/charts
 * - `monitoring` — dense realtime time series, rendered by @gravity-ui/yagr
 *
 * Engine bundles are loaded lazily by ChartKit plugins (React.lazy inside
 * @gravity-ui/chartkit), so a mode's engine is fetched only when it is first
 * rendered.
 */

export type VizWidgetMode = 'sales' | 'monitoring';

export interface SalesPoint {
    /** Timestamp, ms (datetime x-axis). */
    t: number;
    value: number;
}

export interface SalesSeries {
    name: string;
    points: SalesPoint[];
}

export interface SalesModeData {
    series: SalesSeries[];
    yAxisTitle?: string;
}

export interface MonitoringSeries {
    /** Unique series id (stable across updates). */
    id: string;
    name: string;
    /** Concrete color for the canvas renderer; falls back to the widget palette. */
    color?: string;
    /** One value per `timeline` entry; `null` renders a gap. */
    values: (number | null)[];
}

export interface MonitoringModeData {
    /** Timestamps, ms — shared x-axis for all series. */
    timeline: number[];
    series: MonitoringSeries[];
}

export type VizWidgetProps = {
    /** Chart title (rendered inside the chart for `sales`, as header otherwise). */
    title?: string;
    /** Explicit wrapper height in px — ChartKit fills its parent. */
    height?: number;
} & (
    | {mode: 'sales'; sales: SalesModeData}
    | {mode: 'monitoring'; monitoring: MonitoringModeData}
);
