import { useCallback, useState } from 'react';
import { Button, Flex, Text, ThemeProvider, useTheme } from '@gravity-ui/uikit';
import type { Theme } from '@gravity-ui/uikit';

// Дочерний компонент читает текущую тему актуальным хуком useTheme.
function ThemeSwitcher({ onToggle }: { onToggle: () => void }) {
  const theme = useTheme();
  const isDark = theme === 'dark';

  return (
    <Flex direction="column" gap={3} alignItems="flex-start" style={{ padding: 24 }}>
      <Text variant="header-1">Настройки темы</Text>
      <Text color="secondary">Текущая тема: {isDark ? 'тёмная' : 'светлая'}</Text>
      <Button view="action" size="l" onClick={onToggle}>
        {isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      </Button>
    </Flex>
  );
}

export function App() {
  // Актуальный API текущей мажорной версии: тема задаётся пропом `theme`
  // у ThemeProvider и управляется React-состоянием.
  const [theme, setTheme] = useState<Theme>('light');

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <ThemeSwitcher onToggle={toggleTheme} />
    </ThemeProvider>
  );
}
