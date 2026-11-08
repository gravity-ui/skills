import type {VizTheme} from './types';

/**
 * Категориальная палитра: первые три слота проверены валидатором
 * (CVD ΔE ≥ 8, нормальное зрение ΔE ≥ 15) в обоих режимах.
 * Порядок фиксирован — серия получает цвет по индексу в датасете и не
 * перекрашивается при скрытии соседей.
 */
export const CATEGORICAL: Record<VizTheme, readonly string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'],
    dark: ['#3987e5', '#d95926', '#199e70', '#c98500', '#d55181', '#008300', '#9085e9', '#e66767'],
};

export const CHROME: Record<VizTheme, {surface: string; grid: string; axis: string; muted: string}> = {
    light: {surface: '#fcfcfb', grid: '#e1e0d9', axis: '#c3c2b7', muted: '#898781'},
    dark: {surface: '#1a1a19', grid: '#2c2c2a', axis: '#383835', muted: '#898781'},
};
