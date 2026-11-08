import type {RealTheme} from '@gravity-ui/uikit';

export type ThemeMode = Extract<RealTheme, 'light' | 'dark'>;

const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: ThemeMode = 'light';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

/** Read the saved theme; falls back to the default when absent/invalid/unavailable. */
export function getInitialTheme(): ThemeMode {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isThemeMode(stored) ? stored : DEFAULT_THEME;
  } catch {
    // localStorage can throw (e.g. disabled cookies / SSR) — fall back to default
    return DEFAULT_THEME;
  }
}

/** Persist the chosen theme so it survives page reloads. */
export function saveTheme(theme: ThemeMode): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore write failures (private mode, quota, etc.)
  }
}
