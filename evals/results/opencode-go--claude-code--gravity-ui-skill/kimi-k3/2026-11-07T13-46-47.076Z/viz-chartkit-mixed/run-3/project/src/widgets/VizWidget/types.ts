/**
 * The two modes of the unified visualization widget.
 * Each mode is served by its own chart engine, dispatched through the single
 * ChartKit API (`type` + `data`) and lazy-loaded on first use:
 * - 'sales'      → @gravity-ui/charts via the 'gravity-charts' ChartKit plugin
 * - 'monitoring' → @gravity-ui/yagr via the 'yagr' ChartKit plugin
 */
export type VizWidgetMode = 'sales' | 'monitoring';
