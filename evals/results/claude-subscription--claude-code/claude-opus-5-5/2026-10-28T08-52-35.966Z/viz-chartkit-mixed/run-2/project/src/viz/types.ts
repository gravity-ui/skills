export type VizMode = 'sales' | 'monitoring';

export type VizSeries = {
    /** Stable identifier: the series keeps its palette slot across modes and re-renders. */
    id: string;
    name: string;
    /** Values aligned with `VizDataset.timeline`; `null` is a gap. */
    values: ReadonlyArray<number | null>;
    /** Overrides the palette color. */
    color?: string;
};

/** One data shape for every mode — the engine-specific format is derived from it. */
export type VizDataset = {
    /** Unix timestamps in milliseconds, ascending. */
    timeline: ReadonlyArray<number>;
    series: ReadonlyArray<VizSeries>;
    /** Formats values in tooltips, e.g. `1 250 000 ₽` or `42 мс`. */
    formatValue?: (value: number) => string;
};

export type VizWidgetProps = {
    title: string;
    datasets: Record<VizMode, VizDataset>;
    /** Controlled mode. */
    mode?: VizMode;
    /** Initial mode when uncontrolled. */
    defaultMode?: VizMode;
    onModeChange?: (mode: VizMode) => void;
    /** Height of the plot area in px. */
    height?: number;
};

export type VizWidgetRef = {
    /** Re-measures the container and redraws the active chart. */
    reflow: () => void;
};
