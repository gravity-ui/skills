/**
 * Единый источник правды по цветам виджета (валидирован scripts/validate_palette.js):
 * категориальные слоты в фиксированном порядке, светлая и тёмная ступени подобраны
 * под свои поверхности. Движки получают палитру пропом, а корень виджета
 * дополнительно выставляет те же значения как CSS-переменные (см. ChartWidget).
 */
export type ThemeMode = 'light' | 'dark';

export interface ModePalette {
  /** Категориальные слоты — строго в этом порядке, никогда не циклим. */
  series: string[];
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  gridline: string;
  baseline: string;
  border: string;
}

export const MAX_SERIES = 8;

export const PALETTES: Record<ThemeMode, ModePalette> = {
  light: {
    series: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    surface: '#fcfcfb',
    textPrimary: '#0b0b0b',
    textSecondary: '#52514e',
    textMuted: '#898781',
    gridline: '#e1e0d9',
    baseline: '#c3c2b7',
    border: 'rgba(11,11,11,0.10)',
  },
  dark: {
    series: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
    surface: '#1a1a19',
    textPrimary: '#f0efec',
    textSecondary: '#c3c2b7',
    textMuted: '#898781',
    gridline: '#2c2c2a',
    baseline: '#383835',
    border: 'rgba(255,255,255,0.10)',
  },
};
