export const THEME_STORAGE_KEY = 'app-theme';

export const APP_THEMES = ['light', 'dark', 'system'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_THEME: AppTheme = 'system';

type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function isAppTheme(value: unknown): value is AppTheme {
    return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

/** localStorage may be missing (SSR) or throw on access (privacy mode, disabled cookies). */
function getLocalStorage(): ThemeStorage | null {
    try {
        return typeof window === 'undefined' ? null : window.localStorage;
    } catch {
        return null;
    }
}

export function readStoredTheme(storage: ThemeStorage | null = getLocalStorage()): AppTheme {
    try {
        const value = storage?.getItem(THEME_STORAGE_KEY);
        return isAppTheme(value) ? value : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

export function writeStoredTheme(
    theme: AppTheme,
    storage: ThemeStorage | null = getLocalStorage(),
): void {
    try {
        storage?.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Quota exceeded or storage disabled: the theme still applies for this session.
    }
}
