import * as React from 'react';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'gravity-demo-theme';

function getInitialTheme(): AppTheme {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Light/dark theme state, persisted in localStorage. */
export function useAppTheme() {
  const [theme, setTheme] = React.useState<AppTheme>(getInitialTheme);

  React.useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = React.useCallback(
    () => setTheme((current) => (current === 'light' ? 'dark' : 'light')),
    [],
  );

  return { theme, setTheme, toggleTheme };
}
