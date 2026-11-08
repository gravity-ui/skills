export type AppTheme = 'light' | 'dark';

// Keep in sync with the inline script in index.html (pre-paint restore).
export const THEME_STORAGE_KEY = 'app-theme';

const DEFAULT_THEME: AppTheme = 'light';

export function readStoredTheme(): AppTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark') {
      return value;
    }
  } catch {
    // localStorage is unavailable (private mode, disabled cookies, etc.)
  }
  return DEFAULT_THEME;
}

export function writeStoredTheme(theme: AppTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore write failures — the switcher still works for the session.
  }
}
