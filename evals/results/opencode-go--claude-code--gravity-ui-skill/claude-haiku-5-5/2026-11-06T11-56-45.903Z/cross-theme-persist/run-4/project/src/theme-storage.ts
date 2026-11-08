export type AppTheme = 'light' | 'dark' | 'system';

export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_THEME: AppTheme = 'light';

const APP_THEMES: readonly AppTheme[] = ['light', 'dark', 'system'];

function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

/** Reads the saved theme; falls back to the default for missing, invalid or unavailable storage. */
export function loadSavedTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // localStorage can throw (disabled storage, privacy restrictions); use the default.
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: AppTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage is unavailable: the theme still applies for the current session.
  }
}
