import type { ThemeType } from '@gravity-ui/uikit';

/**
 * Series colors per uikit theme.
 *
 * `@gravity-ui/charts` draws SVG strokes with literal colors, so the palette
 * cannot be expressed through `var(--g-color-*)` tokens. The values below are
 * steps of the uikit private palette (`--g-color-private-<hue>-<step>-solid`)
 * for the matching theme, so hues stay in the design system while each theme
 * gets its own lightness. Order is fixed: series N always gets slot N.
 *
 * Light: blue-650, orange-650, purple-600.
 * Dark:  blue-500, orange-600, purple-650.
 */
export const CHART_SERIES_COLORS: Record<ThemeType, string[]> = {
  light: ['#327FC8', '#D36507', '#844DBB'],
  dark: ['#348BDC', '#CE7324', '#A575D6'],
};
