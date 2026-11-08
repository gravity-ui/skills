/**
 * Unified widget API.
 *
 * The consumer describes data in engine-agnostic terms (`VizWidgetData`);
 * `VizWidget` owns the mode switcher and maps each mode onto a chart engine
 * (`gravity-charts` for business charts, `yagr` for dense time series).
 * Engine-specific config never leaks into the public props.
 */
export type VizWidgetMode = 'sales' | 'monitoring';

/** A single sales measurement; `t` is a Unix timestamp in milliseconds. */
export interface SalesPoint {
    t: number;
    value: number;
}

export interface SalesSeries {
    name: string;
    points: SalesPoint[];
}

export interface SalesData {
    series: SalesSeries[];
    /** Y axis caption, e.g. "млн ₽". */
    yAxisTitle?: string;
}

/** A dense time series; `data` aligns index-by-index with `MonitoringData.timeline`. */
export interface MonitoringSeries {
    name: string;
    data: (number | null)[];
    /** Overrides the palette slot assigned by series order. */
    color?: string;
}

export interface MonitoringData {
    /** Unix timestamps in milliseconds (yagr default time multiplier). */
    timeline: number[];
    series: MonitoringSeries[];
    /** IANA timezone for the X axis and tooltip header, e.g. "Europe/Moscow". */
    timeZone?: string;
}

export interface VizWidgetData {
    sales: SalesData;
    monitoring: MonitoringData;
}

export interface VizWidgetProps {
    /** Card heading shown next to the mode switcher. */
    title: string;
    data: VizWidgetData;
    /** Controlled mode. Leave undefined to let the widget manage it. */
    mode?: VizWidgetMode;
    /** Initial mode when uncontrolled. @default 'sales' */
    defaultMode?: VizWidgetMode;
    onModeChange?: (mode: VizWidgetMode) => void;
    /** Chart area height in px. @default 320 */
    height?: number;
}
