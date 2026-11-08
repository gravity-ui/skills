// Helpers for persisting and restoring the UI theme via localStorage.

export const THEME_STORAGE_KEY = 'app-theme';

export type Theme = 'light' | 'dark';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** Read the saved theme, falling back to the OS preference. */
export function getInitialTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isTheme(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable (private mode, disabled cookies, etc.)
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

  return 'light';
}

/** Persist the chosen theme so it survives a page reload. */
export function saveTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore write errors; the toggle still works for the current session.
  }
}

/** Mirror the theme onto <body> so the whole page (not only the app subtree) is themed. */
export function applyThemeToBody(theme: Theme): void {
  document.body.classList.remove('g-root_theme_light', 'g-root_theme_dark');
  document.body.classList.add(`g-root_theme_${theme}`);
}
