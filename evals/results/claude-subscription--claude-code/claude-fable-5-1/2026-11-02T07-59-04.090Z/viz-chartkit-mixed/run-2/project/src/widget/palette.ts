import type {ChartWidgetTheme} from './types';

/**
 * Категориальная палитра: первые три слота проверены валидатором
 * (CVD ΔE ≥ 9, normal ΔE ≥ 26) для обеих тем. Порядок слотов фиксирован.
 */
const SERIES_COLORS: Record<ChartWidgetTheme, string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a'],
    dark: ['#3987e5', '#d95926', '#199e70'],
};

export const MAX_SERIES = SERIES_COLORS.light.length;

export function getSeriesColors(theme: ChartWidgetTheme): string[] {
    return SERIES_COLORS[theme];
}

/** Хром графика: сетка и оси одним шагом от поверхности. */
export const CHROME: Record<ChartWidgetTheme, {grid: string; axis: string; muted: string}> = {
    light: {grid: '#e1e0d9', axis: '#c3c2b7', muted: '#898781'},
    dark: {grid: '#2c2c2a', axis: '#383835', muted: '#898781'},
};
