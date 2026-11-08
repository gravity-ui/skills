import { useState, type ReactNode } from 'react';
import { Switch, ThemeProvider, type Theme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'theme';
const SUPPORTED_THEMES = ['light', 'dark'] as const;

type PersistedTheme = (typeof SUPPORTED_THEMES)[number];

function readPersistedTheme(): PersistedTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const theme = localStorage.getItem(THEME_STORAGE_KEY);

  return SUPPORTED_THEMES.find((supportedTheme) => supportedTheme === theme) ?? 'light';
}

export function ThemeManager({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<PersistedTheme>(readPersistedTheme);

  const changeTheme = (isDark: boolean) => {
    const nextTheme: PersistedTheme = isDark ? 'dark' : 'light';

    setTheme(nextTheme);
    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  };

  return (
    <ThemeProvider theme={theme satisfies Theme}>
      {children}
      <Switch
        checked={theme === 'dark'}
        onChange={(event) => changeTheme(event.target.checked)}
      >
        Тёмная тема
      </Switch>
    </ThemeProvider>
  );
}
