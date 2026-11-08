import type { ThemeType } from '@gravity-ui/uikit';

/**
 * Цвета серий — шаги палитры Gravity UI (private-*-solid), подобранные
 * отдельно для светлой и тёмной поверхности и проверенные валидатором
 * (полоса светлоты, порог хромы, различимость при дальтонизме, контраст).
 *
 * Порядок фиксирован: цвет закреплён за серией, а не за её позицией.
 */
const SERIES_COLORS: Record<ThemeType, string[]> = {
  // поверхность #ffffff: blue-600, orange-600, purple-600
  light: ['#348bdc', '#e96e03', '#844dbb'],
  // поверхность #221d22: blue-550, orange-600, purple-600
  dark: ['#3697f1', '#ce7324', '#9a63d1'],
};

export function getSeriesColors(themeType: ThemeType): string[] {
  return SERIES_COLORS[themeType];
}

/**
 * Хром графика (сетка, оси, подписи, поверхность) берётся напрямую из
 * CSS-токенов Gravity UI, поэтому переключается вместе с темой без JS.
 */
export const CHROME = {
  surface: 'var(--g-color-base-background)',
  grid: 'var(--g-color-line-generic)',
  axis: 'var(--g-color-line-generic-accent)',
  textPrimary: 'var(--g-color-text-primary)',
  textSecondary: 'var(--g-color-text-secondary)',
  textHint: 'var(--g-color-text-hint)',
  crosshair: 'var(--g-color-line-generic-accent)',
} as const;
