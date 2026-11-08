import {useEffect, useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function readSavedTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>(readSavedTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Keep theme switching available when browser storage is unavailable.
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <main style={{padding: 24}}>
        <h1>Тема оформления</h1>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
      </main>
    </ThemeProvider>
  );
}
