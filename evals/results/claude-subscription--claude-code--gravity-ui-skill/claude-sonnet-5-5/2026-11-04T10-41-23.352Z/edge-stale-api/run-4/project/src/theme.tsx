import React from 'react';
import {SegmentedRadioGroup, ThemeProvider, useTheme} from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';

const STORAGE_KEY = 'app-theme';

const isAppTheme = (value: unknown): value is AppTheme => value === 'light' || value === 'dark';

function getInitialTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isAppTheme(stored)) {
      return stored;
    }
  } catch {
    // localStorage unavailable — fall through to OS preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const SetThemeContext = React.createContext<(theme: AppTheme) => void>(() => {});

/**
 * In uikit 7 the theme is controlled only through the `theme` prop of `ThemeProvider`;
 * `useTheme` / `useThemeValue` are read-only. So the state lives in this wrapper.
 */
export function AppThemeProvider({children}: React.PropsWithChildren) {
  const [theme, setThemeState] = React.useState<AppTheme>(getInitialTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
  }, []);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SetThemeContext.Provider>
  );
}

export function ThemeSwitcher() {
  const theme = useTheme();
  const setTheme = React.useContext(SetThemeContext);

  return (
    <SegmentedRadioGroup<AppTheme>
      aria-label="Тема оформления"
      value={isAppTheme(theme) ? theme : null}
      onUpdate={setTheme}
      options={[
        {value: 'light', content: 'Светлая'},
        {value: 'dark', content: 'Тёмная'},
      ]}
    />
  );
}
