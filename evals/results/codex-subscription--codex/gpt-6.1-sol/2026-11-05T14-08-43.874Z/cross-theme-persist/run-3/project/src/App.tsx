import {useEffect, useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

import './App.css';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'theme';

function getSavedTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // The switch still works when browser storage is unavailable.
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Keep the selected theme for this session if storage is unavailable.
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme} rootClassName="app-theme">
      <main>
        <h1>Тема оформления</h1>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <p>Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}.</p>
      </main>
    </ThemeProvider>
  );
}
