import { Button, Card, Flex, Text, useThemeValue } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';
import type { AppTheme } from './themeStorage';

export interface AppProps {
  onThemeChange: (theme: AppTheme) => void;
}

export function App({ onThemeChange }: AppProps) {
  const themeValue = useThemeValue();

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="header-1">Настройки</Text>
        <ThemeSwitcher onThemeChange={onThemeChange} />
      </Flex>

      <Card view="outlined" style={{ padding: 16 }}>
        <Flex direction="column" gap={2} alignItems="flex-start">
          <Text variant="subheader-2">Пример контента</Text>
          <Text color="secondary">
            Текущая тема: <b>{themeValue}</b>
          </Text>
          <Flex gap={2}>
            <Button view="action">Основная кнопка</Button>
            <Button view="outlined">Второстепенная</Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
