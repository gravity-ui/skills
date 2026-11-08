export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

export function getInitialTheme(): AppTheme {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme: AppTheme) {
  window.localStorage.setItem(STORAGE_KEY, theme);
}
