import {useEffect, useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): AppTheme {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // Storage can be unavailable, for example due to browser privacy settings.
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme switching still works when the browser cannot persist the choice.
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <div style={{padding: 'var(--g-spacing-6)'}}>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
      </div>
    </ThemeProvider>
  );
}
