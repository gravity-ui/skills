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
    // Storage may be unavailable; keep the default theme usable.
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  const handleThemeChange = (checked: boolean) => {
    const nextTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Switching still works when the browser cannot persist the preference.
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{padding: 'var(--g-spacing-6)'}}>
        <Switch checked={theme === 'dark'} onUpdate={handleThemeChange}>
          Тёмная тема
        </Switch>
      </div>
    </ThemeProvider>
  );
}
