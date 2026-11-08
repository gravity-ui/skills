export type AppTheme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_THEME: AppTheme = 'light';

const THEMES: readonly AppTheme[] = ['light', 'dark', 'system'];

export function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

/**
 * Returns the saved theme, or DEFAULT_THEME when nothing (or garbage) is stored.
 * localStorage access is wrapped in try/catch: it throws when storage is disabled
 * (privacy settings, sandboxed iframes, some private modes).
 */
export function readStoredTheme(): AppTheme {
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isAppTheme(value) ? value : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

export function writeStoredTheme(theme: AppTheme): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Storage unavailable or full — the theme still works for this session.
    }
}
