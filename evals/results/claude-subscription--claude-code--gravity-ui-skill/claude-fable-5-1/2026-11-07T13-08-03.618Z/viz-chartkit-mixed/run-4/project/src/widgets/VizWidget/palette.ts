/**
 * Series palette for both chart engines.
 *
 * Chart series have no semantic `--g-*` token, so the palette is the one
 * design parameter kept as literal colors. Values come from the validated
 * categorical palette of the dataviz method, in fixed slot order; the dark
 * column is the same hues re-stepped for the dark surface. The first three
 * slots pass every check (lightness band, chroma, CVD and normal-vision
 * separation) against the uikit light (#ffffff) and dark (#221d22) surfaces.
 * Slots with a light-mode contrast warning are relieved by the summary table
 * the widget renders under the chart, so no value is reachable by hover only.
 */
export const SERIES_PALETTE: Record<'light' | 'dark', readonly string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

/** Returns the palette for a uikit theme name (`light`, `dark`, `light-hc`, `dark-hc`). */
export function getSeriesPalette(theme: string): readonly string[] {
    return theme.startsWith('dark') ? SERIES_PALETTE.dark : SERIES_PALETTE.light;
}

/** Color for series at `index`; the palette never cycles past its length. */
export function getSeriesColor(palette: readonly string[], index: number): string {
    return palette[Math.min(index, palette.length - 1)];
}
