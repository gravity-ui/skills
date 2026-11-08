/** Rendering mode of the widget. Each mode maps to its own chart engine. */
export type VizMode = 'sales' | 'monitoring';

/** One point of a regular business series (sales chart). */
export interface SalesPoint {
    /** Unix timestamp in milliseconds. */
    x: number;
    y: number;
}

export interface SalesSeries {
    name: string;
    data: SalesPoint[];
}

/** Dense time series: a shared timeline plus one value array per metric. */
export interface MonitoringSeries {
    name: string;
    /** Same length as `timeline`; `null` is a gap. */
    values: Array<number | null>;
}

export interface SalesDataset {
    series: SalesSeries[];
    /** Unit shown in tooltip, e.g. "₽". */
    unit?: string;
}

export interface MonitoringDataset {
    /** Unix timestamps in milliseconds, ascending. */
    timeline: number[];
    series: MonitoringSeries[];
    /** Unit shown on the Y axis and in tooltip, e.g. "ms" or "%". */
    unit?: string;
}

/** Unified data contract for both modes. */
export interface VizWidgetData {
    sales: SalesDataset;
    monitoring: MonitoringDataset;
}
