import type {ThemeType} from '@gravity-ui/uikit';

/**
 * Категориальная палитра из скилла dataviz (references/palette.md, reference instance).
 * Порядок слотов — часть механизма безопасности для дальтонизма: его нельзя менять
 * без повторной валидации (scripts/validate_palette.js). Цвета не циклируются:
 * серии сверх лимита отбрасываются, а не получают сгенерированный оттенок.
 *
 * Это данные, а не UI-chrome, поэтому здесь намеренно хекс-значения, а не токены `--g-*`.
 */
const LIGHT_SERIES_COLORS = [
    '#2a78d6', // 1 blue
    '#eb6834', // 2 orange
    '#1baf7a', // 3 aqua
    '#eda100', // 4 yellow
    '#e87ba4', // 5 magenta
    '#008300', // 6 green
    '#6250d6', // 7 violet
    '#e34948', // 8 red
];

const DARK_SERIES_COLORS = [
    '#3987e5',
    '#d95926',
    '#199e70',
    '#c98500',
    '#d55181',
    '#008300',
    '#9085e9',
    '#e66767',
];

export const MAX_SERIES = LIGHT_SERIES_COLORS.length;

export function getSeriesColors(themeType: ThemeType): string[] {
    return themeType === 'dark' ? DARK_SERIES_COLORS : LIGHT_SERIES_COLORS;
}
