import type {ThemeName} from './types';

/**
 * Категориальные слоты 1–2 (синий, оранжевый). Порядок фиксирован, цвет
 * привязан к индексу серии. Проверено validate_palette.js: CVD ΔE ≥ 8, контраст ≥ 3:1
 * на поверхностях #fcfcfb / #1a1a19.
 */
const SERIES_COLORS: Record<ThemeName, string[]> = {
  light: ['#2a78d6', '#eb6834'],
  dark: ['#3987e5', '#d95926'],
};

export const MAX_SERIES = SERIES_COLORS.light.length;

export function getSeriesColor(theme: ThemeName, index: number): string {
  return SERIES_COLORS[theme][index % MAX_SERIES];
}
