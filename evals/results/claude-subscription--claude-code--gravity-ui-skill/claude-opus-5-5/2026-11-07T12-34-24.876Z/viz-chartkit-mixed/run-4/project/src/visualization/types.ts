/**
 * Public, engine-agnostic API of the visualization widget.
 *
 * Callers describe *what* to show (time series + formatting); the widget
 * decides *how* to render it depending on the selected mode:
 *  - `sales`      → regular line chart (ChartKit `gravity-charts` plugin);
 *  - `monitoring` → dense time series (ChartKit `yagr` plugin, canvas/uPlot).
 */

export type VisualizationMode = 'sales' | 'monitoring';

export interface TimeSeries {
    /** Stable unique id of the series. */
    id: string;
    /** Human-readable name used in legend and tooltip. */
    name: string;
    /** Unix timestamps in milliseconds, ascending. Same length as `values`. */
    timestamps: number[];
    /** Values aligned with `timestamps`; `null` marks a gap. */
    values: Array<number | null>;
}

export interface VisualizationDataset {
    series: TimeSeries[];
    /** Y axis caption, e.g. "Выручка, ₽" or "Задержка, мс". */
    yAxisTitle?: string;
    /** IANA timezone for X axis labels and tooltip header (monitoring mode). */
    timeZone?: string;
}

export type VisualizationDatasets = Record<VisualizationMode, VisualizationDataset>;

export interface VisualizationWidgetProps {
    /** Widget heading. */
    title: string;
    /** Data for every mode — the same `VisualizationDataset` contract for both. */
    datasets: VisualizationDatasets;
    /** Controlled mode. Omit to let the widget manage it. */
    mode?: VisualizationMode;
    /** Initial mode for the uncontrolled widget. Default: `sales`. */
    defaultMode?: VisualizationMode;
    onModeChange?: (mode: VisualizationMode) => void;
    /** Height of the chart area in px. Default: 360. */
    height?: number;
    /** Called when the chart engine fails to load or render. */
    onError?: (error: unknown, mode: VisualizationMode) => void;
}

/** Imperative handle, identical for both modes. */
export interface VisualizationWidgetRef {
    /** Re-measures the container and redraws the active chart. */
    reflow: () => void;
}
