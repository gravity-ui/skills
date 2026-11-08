import type {VizTheme} from './types';

/**
 * Категориальная палитра серий. Порядок слотов фиксированный — он и обеспечивает
 * различимость при цветовой слепоте. Проверено `validate_palette.js` (skill dataviz)
 * на подложках uikit: светлая #ffffff, тёмная #221d22 — все жёсткие проверки пройдены.
 */
export const SERIES_PALETTE: Record<VizTheme, readonly string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

export const MAX_SERIES = SERIES_PALETTE.light.length;

/** Цвета для `count` серий. Палитра не зацикливается: больше 8 серий — ошибка конфигурации. */
export function getSeriesColors(theme: VizTheme, count: number): string[] {
    if (count > MAX_SERIES) {
        throw new Error(`VizWidget поддерживает не более ${MAX_SERIES} серий, передано ${count}`);
    }
    return SERIES_PALETTE[theme].slice(0, count);
}

/** Приводит тему uikit (`light`, `dark`, `light-hc`, `dark-hc`) к теме палитры. */
export function normalizeTheme(theme: string): VizTheme {
    return theme.startsWith('dark') ? 'dark' : 'light';
}
