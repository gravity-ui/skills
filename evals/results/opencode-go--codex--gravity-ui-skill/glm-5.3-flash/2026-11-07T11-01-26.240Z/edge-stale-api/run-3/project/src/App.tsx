import { Flex, Switch, Text, useThemeType } from '@gravity-ui/uikit';

import { toggleTheme } from './main';

export function App() {
  const theme = useThemeType();
  const isDarkTheme = theme === 'dark';

  return (
    <Flex
      direction="column"
      gap="4"
      style={{ minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}
    >
      <Text variant="header-1" color="primary">
        Theme switcher
      </Text>
      <Text variant="body-2" color="secondary">
        Current theme: {theme}
      </Text>
      <Switch size="l" checked={isDarkTheme} onUpdate={toggleTheme}>
        Dark theme
      </Switch>
    </Flex>
  );
}
