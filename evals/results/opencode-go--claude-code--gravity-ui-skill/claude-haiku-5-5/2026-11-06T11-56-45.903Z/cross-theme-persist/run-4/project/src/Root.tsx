import { useCallback, useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { loadSavedTheme, saveTheme, type AppTheme } from './theme-storage';

// Owns the theme state: it is read from localStorage on mount (so the saved theme
// is applied on the first render after reload) and written back on every change.
export function Root() {
  const [theme, setTheme] = useState<AppTheme>(loadSavedTheme);

  const changeTheme = useCallback((next: AppTheme) => {
    saveTheme(next);
    setTheme(next);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={changeTheme} />
    </ThemeProvider>
  );
}
