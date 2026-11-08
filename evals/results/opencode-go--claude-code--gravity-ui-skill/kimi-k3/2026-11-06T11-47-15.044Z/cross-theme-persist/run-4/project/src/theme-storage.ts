export type StoredTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';
const DEFAULT_THEME: StoredTheme = 'light';

function isStoredTheme(value: unknown): value is StoredTheme {
  return value === 'light' || value === 'dark';
}

export function loadTheme(): StoredTheme {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isStoredTheme(value) ? value : DEFAULT_THEME;
  } catch {
    // localStorage may be unavailable (private mode, disabled storage)
    return DEFAULT_THEME;
  }
}

export function saveTheme(theme: StoredTheme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // ignore write failures — the switcher still works for the session
  }
}
