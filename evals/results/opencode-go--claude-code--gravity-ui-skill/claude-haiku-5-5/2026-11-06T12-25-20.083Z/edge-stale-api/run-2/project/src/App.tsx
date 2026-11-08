import { Flex, Switch, Text } from '@gravity-ui/uikit';

import type { ThemeName } from './ThemedApp';

interface AppProps {
  theme: ThemeName;
  onThemeChange: (theme: ThemeName) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={4} spacing={{ p: 6 }}>
      <Text variant="header-1">Настройки</Text>
      <Switch
        size="l"
        checked={theme === 'dark'}
        onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      >
        Тёмная тема
      </Switch>
    </Flex>
  );
}
