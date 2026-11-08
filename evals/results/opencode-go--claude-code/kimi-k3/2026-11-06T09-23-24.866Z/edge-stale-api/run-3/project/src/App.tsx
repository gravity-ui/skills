import { useEffect, useState } from 'react';
import { Icon, Switch, Text, ThemeProvider, useThemeValue } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';
import { Moon, Sun } from '@gravity-ui/icons';

const THEME_STORAGE_KEY = 'app-theme';

function readInitialTheme(): RealTheme {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // localStorage unavailable — fall through to system preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function ThemeToggle({ onChange }: { onChange: (theme: RealTheme) => void }) {
  // useThemeValue returns the resolved ("real") theme inside ThemeProvider
  const theme = useThemeValue();
  const isDark = theme === 'dark';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <Icon data={Sun} size={18} />
      <Switch
        size="l"
        checked={isDark}
        onUpdate={(checked) => onChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
      <Icon data={Moon} size={18} />
      <Text variant="body-2" color="secondary">
        Текущая тема: {isDark ? 'тёмная' : 'светлая'}
      </Text>
    </div>
  );
}

export function App() {
  const [theme, setTheme] = useState<RealTheme>(readInitialTheme);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors (e.g. private mode)
    }
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          padding: 24,
          minHeight: '100vh',
          background: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
        }}
      >
        <ThemeToggle onChange={setTheme} />
      </div>
    </ThemeProvider>
  );
}
