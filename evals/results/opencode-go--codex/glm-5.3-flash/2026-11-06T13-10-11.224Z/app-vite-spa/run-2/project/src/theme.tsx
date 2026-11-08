import { ThemeProvider } from '@gravity-ui/uikit';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type StoredTheme = 'light' | 'dark';

const themeStorageKey = 'app-theme';

const ThemeStateContext = createContext<{
  theme: StoredTheme;
  toggleTheme: () => void;
}>({
  theme: 'light',
  toggleTheme: () => {},
});

function getInitialTheme(): StoredTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  const storedTheme = window.localStorage.getItem(themeStorageKey);
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProviderWithStorage({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<StoredTheme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const contextValue = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light')),
    }),
    [theme],
  );

  return (
    <ThemeStateContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeStateContext.Provider>
  );
}

export function useThemeState() {
  return useContext(ThemeStateContext);
}
