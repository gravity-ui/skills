import * as React from 'react';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';

const STORAGE_KEY = 'app-theme';
const THEMES: readonly Theme[] = ['light', 'dark', 'system'];

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (THEMES as readonly string[]).includes(stored)) {
      return stored as Theme;
    }
  } catch {
    // localStorage может быть недоступен (приватный режим и т.п.)
  }
  return 'system';
}

const SetThemeContext = React.createContext<(theme: Theme) => void>(() => {});

/** Хранит выбранную тему (с сохранением в localStorage) и отдаёт её в ThemeProvider. */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<Theme>(readStoredTheme);

  const setTheme = React.useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // игнорируем: тема просто не сохранится между сессиями
    }
  }, []);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SetThemeContext.Provider>
  );
}

export function useSetTheme() {
  return React.useContext(SetThemeContext);
}
