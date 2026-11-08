import { useState } from 'react';
import { Switch, ThemeProvider } from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function changeTheme(checked: boolean) {
    const nextTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the switch working when browser storage is unavailable.
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <main style={{ padding: 24 }}>
        <Switch checked={theme === 'dark'} onUpdate={changeTheme}>
          Тёмная тема
        </Switch>
      </main>
    </ThemeProvider>
  );
}
