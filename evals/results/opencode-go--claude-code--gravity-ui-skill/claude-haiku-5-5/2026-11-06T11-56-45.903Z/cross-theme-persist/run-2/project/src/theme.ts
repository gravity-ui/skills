import * as React from 'react';
import type { Theme } from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_THEME: Theme = 'light';

export const THEME_OPTIONS: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: 'light', label: 'Светлая' },
  { value: 'dark', label: 'Тёмная' },
  { value: 'light-hc', label: 'Светлая (высокий контраст)' },
  { value: 'dark-hc', label: 'Тёмная (высокий контраст)' },
  { value: 'system', label: 'Как в системе' },
];

export function isTheme(value: unknown): value is Theme {
  return THEME_OPTIONS.some((option) => option.value === value);
}

export function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(stored) ? stored : DEFAULT_THEME;
  } catch {
    // localStorage может быть недоступен (отключённое хранилище, приватный режим)
    return DEFAULT_THEME;
  }
}

export function writeStoredTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Тема всё равно применится в текущей сессии, просто не сохранится
  }
}

export function useStoredTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);

  const setTheme = React.useCallback((next: Theme) => {
    writeStoredTheme(next);
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}
