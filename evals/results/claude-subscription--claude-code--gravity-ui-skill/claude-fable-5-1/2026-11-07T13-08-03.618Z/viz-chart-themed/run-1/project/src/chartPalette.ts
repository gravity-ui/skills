import type {ThemeType} from '@gravity-ui/uikit';

/**
 * Series colors for `@gravity-ui/charts`.
 *
 * `@gravity-ui/charts` paints axes, grid, labels, legend and tooltip with the
 * semantic `--g-*` tokens, so those adapt to the theme automatically. Series
 * colors, however, are plain CSS color strings in `data.colors` (uikit exposes
 * no semantic token for them), so we keep one set per theme type. The dark set
 * is the same hues re-stepped for the dark surface, not a brightness flip.
 *
 * Both sets were checked with a palette validator for lightness band, chroma,
 * colour-vision-deficiency separation and contrast against the Gravity surfaces
 * (`--g-color-base-background` for light and dark).
 */
export const CHART_PALETTE: Record<ThemeType, string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a'],
    dark: ['#3987e5', '#d95926', '#199e70'],
};
