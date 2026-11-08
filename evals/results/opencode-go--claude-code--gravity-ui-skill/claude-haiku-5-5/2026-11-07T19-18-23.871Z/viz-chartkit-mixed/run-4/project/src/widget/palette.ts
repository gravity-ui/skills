/**
 * Categorical palette from the dataviz reference palette (references/palette.md).
 * Slot order is the CVD-safety mechanism: never reorder, never cycle.
 * Validated with scripts/validate_palette.js (light and dark) on 2026-11-07.
 */
export const CATEGORICAL_LIGHT: readonly string[] = [
    '#2a78d6', // 1 blue
    '#eb6834', // 2 orange
    '#1baf7a', // 3 aqua
    '#eda100', // 4 yellow
    '#e87ba4', // 5 magenta
    '#008300', // 6 green
    '#6250d6', // 7 violet
    '#e34948', // 8 red
];

export const CATEGORICAL_DARK: readonly string[] = [
    '#3987e5',
    '#d95926',
    '#199e70',
    '#c98500',
    '#d55181',
    '#008300',
    '#9085e9',
    '#e66767',
];

/** Number of series the palette can carry without folding or cycling. */
export const MAX_SERIES = CATEGORICAL_LIGHT.length;
