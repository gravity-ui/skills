// Categorical palette validated for color-vision deficiency separation in both themes.
// The engines' own defaults can't be used: yagr has no palette at all (every line is
// #222), and the @gravity-ui/charts default puts green next to yellow (protan ΔE 2.2).
// Slots are assigned in fixed order and never cycled.
const LIGHT = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const DARK = ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'];

/** Series past the last slot get a neutral color instead of a reused hue. */
const OVERFLOW = {light: '#8c8b86', dark: '#7a7974'};

export type PaletteTheme = 'light' | 'dark';

export const MAX_DISTINCT_SERIES = LIGHT.length;

export function getSeriesColor(index: number, theme: PaletteTheme): string {
    const palette = theme === 'dark' ? DARK : LIGHT;
    return palette[index] ?? OVERFLOW[theme];
}
