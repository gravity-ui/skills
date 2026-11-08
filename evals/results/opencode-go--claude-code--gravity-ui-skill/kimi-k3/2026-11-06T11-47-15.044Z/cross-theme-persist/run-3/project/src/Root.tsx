import {useCallback, useState} from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';
import {readStoredTheme, writeStoredTheme, type AppTheme} from './themeStorage';

export function Root() {
  // Lazy initializer: read once, before the first render.
  const [theme, setTheme] = useState<AppTheme>(readStoredTheme);

  const handleThemeChange = useCallback((nextTheme: AppTheme) => {
    setTheme(nextTheme);
    writeStoredTheme(nextTheme);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={handleThemeChange} />
    </ThemeProvider>
  );
}
