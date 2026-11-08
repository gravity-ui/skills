import React from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function useAppTheme(): [AppTheme, (theme: AppTheme) => void] {
  const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  return [theme, setTheme];
}
