import type {VizSeries, VizTheme} from './types';

/**
 * Категориальная палитра, 8 слотов в фиксированном порядке.
 * Валидирована на CVD-разделимость и контраст для обеих тем
 * (light: surface #fcfcfb, dark: surface #1a1a19).
 */
export const SERIES_PALETTE: Record<VizTheme, readonly string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

export const MAX_SERIES = SERIES_PALETTE.light.length;

/** Цвет каждой серии: явный `color` или слот палитры по позиции серии в наборе. */
export function resolveSeriesColors(series: VizSeries[], theme: VizTheme): string[] {
    const palette = SERIES_PALETTE[theme];
    return series.map((s, index) => s.color ?? palette[index % palette.length]);
}
