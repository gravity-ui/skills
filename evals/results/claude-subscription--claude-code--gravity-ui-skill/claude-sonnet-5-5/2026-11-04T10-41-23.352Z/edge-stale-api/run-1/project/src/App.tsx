import { useEffect, useState } from 'react';
import { Provider, Text, type Theme } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

const STORAGE_KEY = 'theme';

type AppTheme = Extract<Theme, 'light' | 'dark'>;

function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'light' || saved === 'dark') {
    return saved;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(getInitialTheme);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return (
    <Provider theme={theme}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Text variant="header-1">Gravity UI</Text>
        <ThemeSwitcher theme={theme} onChange={setTheme} />
      </div>
    </Provider>
  );
}
