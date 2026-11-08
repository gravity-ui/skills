export const THEME_STORAGE_KEY = 'app-theme';

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const;
export type ThemeOption = (typeof THEME_OPTIONS)[number];

export const DEFAULT_THEME: ThemeOption = 'light';

export function isThemeOption(value: unknown): value is ThemeOption {
    return typeof value === 'string' && (THEME_OPTIONS as readonly string[]).includes(value);
}

/** Reads the saved theme; falls back to the default on missing/invalid value or blocked storage. */
export function readStoredTheme(): ThemeOption {
    try {
        const value = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeOption(value) ? value : DEFAULT_THEME;
    } catch {
        // localStorage can throw (privacy mode, disabled storage, sandboxed iframe).
        return DEFAULT_THEME;
    }
}

export function writeStoredTheme(theme: ThemeOption): void {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Ignore: the theme still applies for the current session.
    }
}
