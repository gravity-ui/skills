import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

function getInitialTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage недоступен — используем системную настройку
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const SetThemeContext = React.createContext<(theme: AppTheme) => void>(() => {});

/** Возвращает функцию установки темы. Текущую тему читайте через useThemeValue/useThemeType из uikit. */
export function useSetTheme() {
  return React.useContext(SetThemeContext);
}

/** Хранит выбранную тему (с сохранением в localStorage) и передаёт её в ThemeProvider из uikit. */
export function AppThemeProvider({ children }: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // игнорируем — тема всё равно применится в рамках сессии
    }
  }, []);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SetThemeContext.Provider>
  );
}
