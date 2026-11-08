import {useState} from 'react';
import {Box, Card, Flex, Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = useState<ThemeType>('light');

  return (
    <ThemeProvider theme={theme}>
      <Box spacing={{p: 6}}>
        <Card type="container" view="outlined" size="l" spacing={{p: 5}}>
          <Flex direction="column" gap={4}>
            <Text variant="header-1">Тема оформления</Text>
            <Switch
              size="l"
              checked={theme === 'dark'}
              onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
              content="Тёмная тема"
            />
            <Text variant="body-1" color="secondary">
              Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
            </Text>
          </Flex>
        </Card>
      </Box>
    </ThemeProvider>
  );
}
