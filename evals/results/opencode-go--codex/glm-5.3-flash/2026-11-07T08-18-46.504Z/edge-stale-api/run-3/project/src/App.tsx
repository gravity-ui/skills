import { Button, Flex, Text } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface AppProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gapRow="4" alignItems="flex-start" style={{ padding: 24 }}>
      <Text variant="header-1">Переключатель темы</Text>
      <Button
        size="l"
        view="outlined"
        onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'}
      </Button>
      <Text variant="body-1">Текущая тема: {theme}</Text>
    </Flex>
  );
}
