import {useEffect, useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';
const THEME_STORAGE_KEY = 'theme';

function getSavedTheme(): AppTheme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch {
    // Storage may be blocked by the browser; keep the switch usable.
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getSavedTheme);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Theme changes still work for this session if saving is unavailable.
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <div style={{padding: 24}}>
        <Switch checked={theme === 'dark'} onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}>
          Тёмная тема
        </Switch>
      </div>
    </ThemeProvider>
  );
}
