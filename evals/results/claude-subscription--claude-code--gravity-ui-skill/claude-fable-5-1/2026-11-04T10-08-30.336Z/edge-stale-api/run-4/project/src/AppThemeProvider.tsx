import * as React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';
// uikit default: follows the OS color scheme and resolves to `light` / `dark`.
const DEFAULT_THEME: Theme = 'system';

interface ThemeSwitcherContextValue {
  /** Theme passed to uikit `ThemeProvider` (may be `system`). */
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeSwitcherContext = React.createContext<ThemeSwitcherContextValue | undefined>(undefined);

function readStoredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/**
 * Root theme provider for the app. Owns the current theme and renders uikit's
 * `ThemeProvider` with it, so switching the theme updates the `.g-root_theme_*`
 * class on `<body>` (uikit's own theming mechanism) for the whole page.
 */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage unavailable (private mode, quota) — the in-memory state still works
    }
  }, []);

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeSwitcherContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeSwitcherContext.Provider>
  );
}

export function useThemeSwitcher(): ThemeSwitcherContextValue {
  const context = React.useContext(ThemeSwitcherContext);
  if (!context) {
    throw new Error('useThemeSwitcher must be used inside <AppThemeProvider>');
  }
  return context;
}
