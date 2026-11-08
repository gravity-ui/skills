import {useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): AppTheme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // Storage may be unavailable; keep the switch usable in memory.
  }

  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  function handleThemeChange(checked: boolean) {
    const nextTheme: AppTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Changing the theme should still work when storage is blocked or full.
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <main style={{padding: 'var(--g-spacing-6)'}}>
        <Switch checked={theme === 'dark'} onUpdate={handleThemeChange}>
          Тёмная тема
        </Switch>
      </main>
    </ThemeProvider>
  );
}
