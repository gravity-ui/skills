import { Button, Flex, Text } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import { ThemeSwitch } from './ThemeSwitch';

interface AppProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={4} spacing={{ p: 6 }}>
      <ThemeSwitch theme={theme} onThemeChange={onThemeChange} />
      <Text variant="header-1">Пример страницы</Text>
      <Text variant="body-1" color="secondary">
        Текст и кнопки меняют цвета вместе с темой.
      </Text>
      <Flex gap={2}>
        <Button view="action">Действие</Button>
        <Button view="outlined">Вторичная</Button>
      </Flex>
    </Flex>
  );
}
