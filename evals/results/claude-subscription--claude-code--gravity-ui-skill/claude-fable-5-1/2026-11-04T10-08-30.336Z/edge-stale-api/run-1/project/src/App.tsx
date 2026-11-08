import {useCallback, useEffect, useState} from 'react';
import {Button, Card, Flex, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

const THEME_STORAGE_KEY = 'app-theme';

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return stored === 'light' || stored === 'dark' ? stored : 'system';
}

export function App() {
  // The outermost ThemeProvider owns the theme: it writes `g-root g-root_theme_*`
  // to <body>, so the state that drives its `theme` prop must live above it.
  const [theme, setTheme] = useState<Theme>(readStoredTheme);

  useEffect(() => {
    if (theme === 'system') {
      window.localStorage.removeItem(THEME_STORAGE_KEY);
    } else {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const handleThemeChange = useCallback((next: Theme) => setTheme(next), []);

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
        <Flex alignItems="center" justifyContent="space-between" gap={4}>
          <Text variant="header-1">Gravity UI</Text>
          <ThemeSwitcher onThemeChange={handleThemeChange} />
        </Flex>

        <Card view="filled" style={{padding: 'var(--g-spacing-4)', maxWidth: 480}}>
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Theme preview</Text>
            <Text variant="body-1" color="secondary">
              The toggle above switches the whole page between the light and dark themes.
              The choice is saved in localStorage; until you pick one, the OS preference is used.
            </Text>
            <Flex gap={2}>
              <Button view="action">Action</Button>
              <Button view="normal">Normal</Button>
              <Button view="outlined">Outlined</Button>
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </ThemeProvider>
  );
}
