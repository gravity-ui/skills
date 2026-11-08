export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

export function readStoredTheme(): AppTheme {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function storeTheme(theme: AppTheme): void {
  localStorage.setItem(STORAGE_KEY, theme);
}
