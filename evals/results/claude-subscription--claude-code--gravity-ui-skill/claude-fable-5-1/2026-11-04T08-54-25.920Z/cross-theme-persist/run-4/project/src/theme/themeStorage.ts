import type {Theme} from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

/** Theme values the switcher offers and the storage accepts. */
export const APP_THEMES = ['light', 'dark', 'system'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = 'system';

export function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

/** Reads the persisted theme; falls back to the default on a missing/corrupt value or no storage. */
export function readStoredTheme(): AppTheme {
    try {
        const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isAppTheme(stored) ? stored : DEFAULT_THEME;
    } catch {
        // localStorage may be unavailable (SSR, privacy mode, disabled storage).
        return DEFAULT_THEME;
    }
}

export function writeStoredTheme(theme: AppTheme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Persisting is best-effort; the in-memory theme still applies.
    }
}

/** Narrow the uikit `Theme` to a value we know how to store. */
export function toAppTheme(theme: Theme): AppTheme {
    return isAppTheme(theme) ? theme : DEFAULT_THEME;
}
