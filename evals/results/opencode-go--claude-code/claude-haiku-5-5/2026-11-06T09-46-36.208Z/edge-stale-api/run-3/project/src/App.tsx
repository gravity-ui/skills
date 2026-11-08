import * as React from 'react';
import { Card, Flex, Switch, Text, ThemeProvider } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = React.useState<ThemeType>('light');

  return (
    <ThemeProvider theme={theme}>
      <Flex direction="column" gap={4} style={{ padding: 24 }}>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>

        <Card type="container" view="outlined" size="l">
          <Text as="h1" variant="header-1">
            Пример карточки
          </Text>
          <Text as="p" variant="body-2">
            Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}.
          </Text>
        </Card>
      </Flex>
    </ThemeProvider>
  );
}
