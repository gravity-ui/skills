/**
 * Categorical palette — the validated default instance (see palette.md).
 * Slots 1–3 pass all six checks in both modes (validator: ALL CHECKS PASS,
 * light surface #ffffff / dark surface #1a1a19). The aqua slot carries a
 * contrast WARN on light, relieved by the legend + tooltip + table view.
 * Hues are assigned to series in this fixed order and never cycled or
 * re-ranked — at most 3 series per chart.
 */

export const SERIES_COLORS = {
  light: ['#2a78d6', '#eb6834', '#1baf7a'],
  dark: ['#3987e5', '#d95926', '#199e70'],
} as const;

export const CHROME = {
  light: {grid: '#e1e0d9', baseline: '#c3c2b7', muted: '#898781'},
  dark: {grid: '#2c2c2a', baseline: '#383835', muted: '#898781'},
} as const;

export function seriesColor(index: number, dark: boolean): string {
  const slots = dark ? SERIES_COLORS.dark : SERIES_COLORS.light;
  return slots[Math.min(index, slots.length - 1)];
}

export function chrome(dark: boolean) {
  return dark ? CHROME.dark : CHROME.light;
}
