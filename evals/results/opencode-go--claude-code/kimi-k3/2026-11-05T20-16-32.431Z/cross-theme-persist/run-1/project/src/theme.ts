export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function isValidTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/**
 * Reads the theme saved in localStorage. Falls back to the system
 * color-scheme preference when nothing valid was stored (e.g. first visit).
 */
export function getInitialTheme(): Theme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (private mode, disabled storage) — ignore.
  }

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

/** Persists the chosen theme so it survives a page reload. */
export function persistTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage write failures (quota, disabled storage) must not break the UI.
  }
}
