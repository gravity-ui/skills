export type ChartWidgetMode = 'sales' | 'monitoring';

export interface SalesSeries {
    id: string;
    name: string;
    /** x — Unix timestamp (ms), y — revenue */
    points: Array<{x: number; y: number}>;
}

export interface MonitoringSeries {
    id: string;
    name: string;
    /** One value per `timeline` entry; `null` is a gap in the data. */
    values: Array<number | null>;
}

export interface MonitoringData {
    /** Unix timestamps (ms), ascending */
    timeline: number[];
    series: MonitoringSeries[];
}

/** Single public API of the widget: both modes are driven by these props. */
export interface ChartWidgetProps {
    /** Controlled mode. */
    mode?: ChartWidgetMode;
    /** Initial mode when uncontrolled. Default: `'sales'`. */
    defaultMode?: ChartWidgetMode;
    onModeChange?: (mode: ChartWidgetMode) => void;
    title?: string;
    /** Data for the `sales` mode (regular line chart). */
    sales: SalesSeries[];
    /** Data for the `monitoring` mode (dense time series). */
    monitoring: MonitoringData;
    /** Chart area height in px. Default: 360. */
    height?: number;
}
