import React, { useState, useCallback, useEffect } from 'react';
import { ThemeProvider, Switch } from '@gravity-ui/uikit';

const THEME_KEY = 'gravity-ui-theme';

type AppTheme = 'light' | 'dark';

function getInitialTheme(): AppTheme {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const handleToggle = useCallback((checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <Switch
          checked={theme === 'dark'}
          onUpdate={handleToggle}
          content="Dark theme"
        />
      </div>
    </ThemeProvider>
  );
}
