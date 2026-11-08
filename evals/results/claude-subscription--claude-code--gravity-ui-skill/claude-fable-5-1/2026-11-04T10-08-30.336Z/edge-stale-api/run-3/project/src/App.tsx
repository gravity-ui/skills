import {Button, Card, Flex, Text, useThemeValue} from '@gravity-ui/uikit';

import {ThemeSwitcher} from './ThemeSwitcher';

export function App() {
  const themeValue = useThemeValue();

  return (
    <Flex direction="column" gap={4} style={{padding: 'var(--g-spacing-6)'}}>
      <Flex alignItems="center" justifyContent="space-between" gap={4}>
        <Text variant="header-1" as="h1">
          Переключатель темы
        </Text>
        <ThemeSwitcher />
      </Flex>

      <Card view="outlined" type="container" style={{padding: 'var(--g-spacing-4)'}}>
        <Flex direction="column" gap={3} alignItems="flex-start">
          <Text variant="body-1">
            Текущая тема: <Text variant="body-1" color="brand">{themeValue}</Text>
          </Text>
          <Text variant="body-1" color="secondary">
            Выбор сохраняется в localStorage. До первого переключения тема следует настройке
            системы.
          </Text>
          <Button view="action" size="m">
            Пример кнопки
          </Button>
        </Flex>
      </Card>
    </Flex>
  );
}
