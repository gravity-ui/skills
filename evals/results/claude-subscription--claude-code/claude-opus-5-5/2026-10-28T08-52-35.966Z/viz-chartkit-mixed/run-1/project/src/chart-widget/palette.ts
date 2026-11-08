// Categorical slots validated together (CVD and normal-vision separation, all pairs)
// against the light and dark chart surfaces. The order is fixed: a series keeps its
// slot regardless of how many series are shown.
const SERIES_COLORS = {
  light: ['#2a78d6', '#eb6834', '#1baf7a'],
  dark: ['#3987e5', '#d95926', '#199e70'],
} as const;

export const MAX_SERIES = SERIES_COLORS.light.length;

export type PaletteTheme = keyof typeof SERIES_COLORS;

export function getSeriesColor(theme: PaletteTheme, index: number): string {
  const colors = SERIES_COLORS[theme];
  if (index >= colors.length) {
    throw new Error(`ChartWidget supports at most ${colors.length} series, got #${index + 1}`);
  }
  return colors[index];
}
