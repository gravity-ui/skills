import { useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';

export type ThemeName = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function readSavedTheme(): ThemeName {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

// Owns the theme state above ThemeProvider: the provider's `theme` prop is the
// only way to switch themes, so the state must live outside of it.
export function ThemedApp() {
  const [theme, setTheme] = useState<ThemeName>(readSavedTheme);

  const changeTheme = (next: ThemeName) => {
    setTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage is unavailable (e.g. privacy mode): keep the in-memory choice only.
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={changeTheme} />
    </ThemeProvider>
  );
}
