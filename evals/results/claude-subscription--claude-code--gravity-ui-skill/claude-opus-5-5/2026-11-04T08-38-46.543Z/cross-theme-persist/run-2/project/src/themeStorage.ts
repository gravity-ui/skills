import type { Theme } from '@gravity-ui/uikit';

export type AppTheme = Extract<Theme, 'system' | 'light' | 'dark'>;

export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_THEME: AppTheme = 'system';

const APP_THEMES: readonly AppTheme[] = ['system', 'light', 'dark'];

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

function getStorage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Access to localStorage can throw (e.g. blocked cookies / sandboxed iframe).
    return null;
  }
}

export function readStoredTheme(storage: Storage | null = getStorage()): AppTheme {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return isAppTheme(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(theme: AppTheme, storage: Storage | null = getStorage()): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Quota exceeded / storage disabled — the theme still applies for this session.
  }
}
