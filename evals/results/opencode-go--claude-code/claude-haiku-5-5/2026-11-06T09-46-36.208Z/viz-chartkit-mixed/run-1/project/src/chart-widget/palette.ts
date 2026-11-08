import type {ChartTheme} from './types';

/**
 * Only the first three categorical slots are used. They are the set that passes
 * the all-pairs gate in both modes (`validate_palette.js --pairs all`), which is
 * the gate scatter, small-multiple and other any-pair forms need. Series beyond
 * this cap are not drawn; the widget says so.
 */
export const MAX_SERIES = 3;

const CATEGORICAL: Record<ChartTheme, readonly string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a'],
    dark: ['#3987e5', '#d95926', '#199e70'],
};

export function seriesColors(theme: ChartTheme, count: number): string[] {
    return CATEGORICAL[theme].slice(0, Math.min(count, MAX_SERIES));
}

export interface ChromeTokens {
    surface: string;
    primary: string;
    secondary: string;
    muted: string;
    gridline: string;
    baseline: string;
    border: string;
}

/** Chart surface and ink, from the reference palette. */
export const CHROME: Record<ChartTheme, ChromeTokens> = {
    light: {
        surface: '#fcfcfb',
        primary: '#0b0b0b',
        secondary: '#52514e',
        muted: '#898781',
        gridline: '#e1e0d9',
        baseline: '#c3c2b7',
        border: 'rgba(11, 11, 11, 0.1)',
    },
    dark: {
        surface: '#1a1a19',
        primary: '#f0efec',
        secondary: '#c3c2b7',
        muted: '#898781',
        gridline: '#2c2c2a',
        baseline: '#383835',
        border: 'rgba(255, 255, 255, 0.1)',
    },
};
