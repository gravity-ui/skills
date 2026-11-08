/**
 * Цвета графика по ролям. Значения — из references/palette.md (dataviz):
 * для одной серии используется только категориальный слот 1 (blue),
 * поверхность — validated chart surface для каждой темы.
 */
export type ChartThemeType = 'light' | 'dark';

export interface ChartPalette {
  /** Поверхность графика (фон карточки) */
  surface: string;
  /** Линия серии — categorical slot 1 */
  seriesLine: string;
  /** Заливка под линией — тон серии ~10% */
  seriesFill: string;
  /** Линии сетки — hairline, recessive */
  grid: string;
  /** Базовая линия осей и засечки */
  axisBaseline: string;
  /** Подписи осей — muted */
  axisText: string;
  /** Вертикальное перекрестие курсора — нейтральный hairline, не цвет серии */
  crosshair: string;
}

export const CHART_PALETTE: Record<ChartThemeType, ChartPalette> = {
  light: {
    surface: '#fcfcfb',
    seriesLine: '#2a78d6',
    seriesFill: 'rgba(42, 120, 214, 0.1)',
    grid: '#e1e0d9',
    axisBaseline: '#c3c2b7',
    axisText: '#898781',
    crosshair: '#898781',
  },
  dark: {
    surface: '#1a1a19',
    seriesLine: '#3987e5',
    seriesFill: 'rgba(57, 135, 229, 0.1)',
    grid: '#2c2c2a',
    axisBaseline: '#383835',
    axisText: '#898781',
    crosshair: '#898781',
  },
};
