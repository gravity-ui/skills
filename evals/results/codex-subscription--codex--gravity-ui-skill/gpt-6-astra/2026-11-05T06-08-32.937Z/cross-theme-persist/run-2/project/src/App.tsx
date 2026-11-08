import { useState } from 'react';
import { Switch, ThemeProvider } from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getSavedTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // Storage can be unavailable; use the default theme in that case.
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  function handleThemeChange(checked: boolean) {
    const nextTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep switching functional even when the preference cannot be saved.
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <Switch checked={theme === 'dark'} onUpdate={handleThemeChange}>
          Тёмная тема
        </Switch>
      </div>
    </ThemeProvider>
  );
}
