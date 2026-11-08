import type { RealTheme } from '@gravity-ui/uikit';

export type AppTheme = Extract<RealTheme, 'light' | 'dark'>;

const STORAGE_KEY = 'app-theme';

/** Сохранённая тема, иначе — системная (prefers-color-scheme). */
export function getInitialTheme(): AppTheme {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function saveTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // игнорируем: тема просто не запомнится
  }
}
