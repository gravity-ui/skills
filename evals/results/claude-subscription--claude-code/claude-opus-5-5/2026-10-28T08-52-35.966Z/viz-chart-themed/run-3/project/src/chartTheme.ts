import type { ThemeType } from '@gravity-ui/uikit';

// Series hues are stepped separately for each theme (not an automatic flip) and
// validated against the Gravity surfaces: light #ffffff, dark rgb(34, 29, 34).
// Order is fixed: series N always gets slot N.
export const SERIES_COLORS: Record<ThemeType, readonly string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500'],
};

// Chart chrome comes straight from Gravity tokens, so it follows the ThemeProvider.
export const CHROME = {
    surface: 'var(--g-color-base-background)',
    textPrimary: 'var(--g-color-text-primary)',
    textSecondary: 'var(--g-color-text-secondary)',
    textHint: 'var(--g-color-text-hint)',
    grid: 'var(--g-color-line-generic)',
    axis: 'var(--g-color-line-generic-accent)',
} as const;
