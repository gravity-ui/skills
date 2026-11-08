import { useState, useCallback } from 'react';
import { ThemeProvider, Switch, Flex, Text } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'app-theme';

function readInitialTheme(): RealTheme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'light-hc' || stored === 'dark-hc') {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, privacy mode, etc.)
  }
  return 'light';
}

export function App() {
  const [theme, setTheme] = useState<RealTheme>(readInitialTheme);

  const handleToggle = useCallback((checked: boolean) => {
    const next: RealTheme = checked ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // silently ignore storage errors
    }
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" gap={4} style={{ padding: "var(--g-spacing-6)" }}>
        <Flex gap={2} alignItems="center">
          <Switch checked={theme === 'dark'} onUpdate={handleToggle} />
          <Text variant="body-1">Dark theme</Text>
        </Flex>
        <Text variant="header-1">Theme Persist Demo</Text>
        <Text variant="body-1" color="secondary">
          Current theme: <strong>{theme}</strong>. Try toggling the switch — the choice is saved to localStorage and restored on reload.
        </Text>
      </Flex>
    </ThemeProvider>
  );
}
