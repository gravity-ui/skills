export const THEME_STORAGE_KEY = 'theme';

export const APP_THEMES = ['light', 'dark'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_APP_THEME: AppTheme = 'light';

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

/** Reads the persisted theme. Returns `null` if nothing valid is stored or storage is unavailable. */
export function readStoredTheme(): AppTheme | null {
  try {
    const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(raw) ? raw : null;
  } catch {
    // localStorage can throw (disabled storage, privacy mode, SSR without window).
    return null;
  }
}

export function writeStoredTheme(theme: AppTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Persisting is best-effort: the in-memory theme still applies for this session.
  }
}
