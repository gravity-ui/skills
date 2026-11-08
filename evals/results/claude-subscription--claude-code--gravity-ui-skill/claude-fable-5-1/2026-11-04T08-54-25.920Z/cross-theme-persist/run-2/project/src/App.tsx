import { Card, Flex, Text } from '@gravity-ui/uikit';

import { useAppTheme } from './AppThemeProvider';
import { ThemeSwitcher } from './ThemeSwitcher';

export function App() {
  const { theme } = useAppTheme();

  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Настройки</Text>
      <Card view="filled" style={{ padding: 16 }}>
        <Flex direction="column" gap={2}>
          <ThemeSwitcher />
          <Text variant="body-1" color="secondary">
            Текущая тема: {theme}. Выбор сохраняется в localStorage и восстанавливается после
            перезагрузки страницы.
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
