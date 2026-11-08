import type {Theme} from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

/** Themes the switcher offers; `system` follows the OS color scheme. */
export const APP_THEMES = ['light', 'dark', 'system'] as const satisfies readonly Theme[];

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = 'system';

export function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

/** Reads the persisted theme; falls back to the default on a missing/unknown value or blocked storage. */
export function readStoredTheme(): AppTheme {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isAppTheme(stored) ? stored : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

/** Persists the theme; silently ignores blocked storage (private mode, quota, disabled). */
export function writeStoredTheme(theme: AppTheme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // storage unavailable — theme stays in memory for this session only
    }
}
