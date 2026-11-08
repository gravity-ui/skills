import { useCallback, useState } from 'react';

export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'theme';
const DEFAULT_THEME: AppTheme = 'light';

function readTheme(): AppTheme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : DEFAULT_THEME;
  } catch {
    // localStorage может быть недоступен (приватный режим, запрет cookies)
    return DEFAULT_THEME;
  }
}

function writeTheme(theme: AppTheme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // не удалось сохранить — тема всё равно переключится в рамках сессии
  }
}

export function useStoredTheme() {
  // Ленивая инициализация: тема читается синхронно до первого рендера, без мигания.
  const [theme, setThemeState] = useState<AppTheme>(readTheme);

  const setTheme = useCallback((next: AppTheme) => {
    setThemeState(next);
    writeTheme(next);
  }, []);

  return { theme, setTheme };
}
