import * as React from 'react';
import { ThemeProvider, type ThemeType } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';

type SetTheme = (theme: ThemeType) => void;

const SetThemeContext = React.createContext<SetTheme | undefined>(undefined);

function getInitialTheme(): ThemeType {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (privacy mode, sandboxed iframe)
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Root Gravity UI ThemeProvider with a controllable light/dark theme.
 * Must be the top-level (non-scoped) provider so the theme class lands on <body>
 * and applies to portals (popups, tooltips, modals) as well.
 */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setTheme] = React.useState<ThemeType>(getInitialTheme);

  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <SetThemeContext.Provider value={setTheme}>{children}</SetThemeContext.Provider>
    </ThemeProvider>
  );
}

export function useSetTheme(): SetTheme {
  const setTheme = React.useContext(SetThemeContext);
  if (!setTheme) {
    throw new Error('useSetTheme must be used within <AppThemeProvider>');
  }
  return setTheme;
}
