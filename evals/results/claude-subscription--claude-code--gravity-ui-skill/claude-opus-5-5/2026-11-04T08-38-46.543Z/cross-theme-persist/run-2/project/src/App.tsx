import { Flex, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  // Resolved theme: 'system' becomes 'light' or 'dark' based on OS preference.
  const themeValue = useThemeValue();

  return (
    <Flex direction="column" gap={4} style={{ padding: 'var(--g-spacing-6)' }}>
      <Text variant="header-1">Тема оформления</Text>
      <ThemeSwitcher />
      <Text color="secondary">Активная тема: {themeValue}</Text>
    </Flex>
  );
}
