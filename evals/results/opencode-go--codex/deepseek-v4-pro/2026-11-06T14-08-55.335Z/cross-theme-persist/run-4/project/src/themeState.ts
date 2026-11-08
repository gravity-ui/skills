import React from 'react';
import type { Theme } from '@gravity-ui/uikit';

const STORAGE_KEY = 'gravity-ui-theme';

function readStoredTheme(): Theme {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'light-hc' || raw === 'dark-hc' || raw === 'system') {
      return raw;
    }
  } catch {}
  return 'system';
}

export interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

export const ThemeStateContext = React.createContext<ThemeState>({
  theme: 'system',
  setTheme: () => {},
});

export function useThemeState(): ThemeState {
  const ctx = React.useContext(ThemeStateContext);
  return ctx;
}

export function useStoredTheme(): [Theme, (t: Theme) => void] {
  const [theme, setTheme] = React.useState<Theme>(readStoredTheme);

  function persist(t: Theme) {
    setTheme(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
  }

  return [theme, persist];
}
