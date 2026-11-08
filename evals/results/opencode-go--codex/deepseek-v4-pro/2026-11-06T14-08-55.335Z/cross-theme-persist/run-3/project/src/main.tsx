// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

import { App } from './App';

const THEME_STORAGE_KEY = 'gravity-ui-theme';

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'light-hc' || stored === 'dark-hc' || stored === 'system') {
      return stored;
    }
  } catch {}
  return 'light';
}

function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {}
}

interface ThemeSwitchContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeSwitchContext = createContext<ThemeSwitchContextValue>({
  theme: 'light',
  setTheme: () => {},
});

export function useThemeSwitch() {
  return useContext(ThemeSwitchContext);
}

function Root() {
  const [theme, setThemeState] = useState<Theme>(loadTheme);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    saveTheme(next);
  }, []);

  const contextValue = useMemo<ThemeSwitchContextValue>(
    () => ({ theme, setTheme }),
    [theme, setTheme],
  );

  return (
    <ThemeProvider theme={theme}>
      <ThemeSwitchContext.Provider value={contextValue}>
        <App />
      </ThemeSwitchContext.Provider>
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
