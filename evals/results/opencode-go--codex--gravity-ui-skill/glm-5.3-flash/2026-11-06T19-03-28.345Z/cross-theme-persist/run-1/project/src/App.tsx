import { Flex, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'gravity-theme';
const THEMES = ['light', 'dark'] as const;

type AppTheme = (typeof THEMES)[number];

function readStoredTheme(): AppTheme {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  return THEMES.find((theme) => theme === storedTheme) ?? 'light';
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>(readStoredTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" gap={4} style={{ padding: 24 }}>
        <Text variant="header-2">Theme</Text>
        <Switch checked={isDark} onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}>
          Dark theme
        </Switch>
        <Text color="secondary">Selected theme: {theme}</Text>
      </Flex>
    </ThemeProvider>
  );
}
