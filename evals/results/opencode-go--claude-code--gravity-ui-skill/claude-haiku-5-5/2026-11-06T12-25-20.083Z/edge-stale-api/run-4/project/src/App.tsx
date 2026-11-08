import {useState} from 'react';

import {Flex, Provider, Switch, Text} from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = useState<AppTheme>('light');

  return (
    <Provider theme={theme}>
      <Flex direction="column" gap="spacing-4" padding="spacing-6">
        <Text variant="header-2">Тема оформления</Text>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <Text variant="body-1" color="secondary">
          Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
        </Text>
      </Flex>
    </Provider>
  );
}
