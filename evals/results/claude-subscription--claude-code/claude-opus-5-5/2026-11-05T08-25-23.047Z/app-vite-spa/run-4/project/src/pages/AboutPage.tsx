import { DefinitionList, Flex, Text } from '@gravity-ui/uikit';

import type { AppTheme } from '../theme';

export function AboutPage({ theme }: { theme: AppTheme }) {
  return (
    <Flex direction="column" gap={4}>
      <Text variant="header-2">О приложении</Text>
      <Text color="secondary">
        Демо одностраничного приложения: маршрутизация на основе hash-адресов без сторонних библиотек и тема,
        переключаемая через ThemeProvider из Gravity UI.
      </Text>
      <DefinitionList>
        <DefinitionList.Item name="Стек">React 18, Vite, TypeScript</DefinitionList.Item>
        <DefinitionList.Item name="UI-библиотека">@gravity-ui/uikit</DefinitionList.Item>
        <DefinitionList.Item name="Текущая тема">{theme === 'dark' ? 'Тёмная' : 'Светлая'}</DefinitionList.Item>
        <DefinitionList.Item name="Страниц">3</DefinitionList.Item>
      </DefinitionList>
    </Flex>
  );
}
