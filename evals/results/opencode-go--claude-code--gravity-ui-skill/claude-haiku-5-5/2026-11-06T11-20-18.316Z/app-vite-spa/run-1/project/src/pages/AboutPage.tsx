import { Box, Card, Flex, Text } from '@gravity-ui/uikit';

export function AboutPage() {
  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">О приложении</Text>
        <Card type="container" view="outlined" size="l">
          <Flex direction="column" gap={3}>
            <Text variant="subheader-2">Стек</Text>
            <Text variant="body-2" color="secondary">
              React, Vite, TypeScript и компоненты из @gravity-ui/uikit и @gravity-ui/navigation.
            </Text>
            <Text variant="subheader-2">Навигация</Text>
            <Text variant="body-2" color="secondary">
              Маршруты заданы хешем адреса (#/tasks, #/about), поэтому работают кнопки «назад» и
              «вперёд» браузера.
            </Text>
            <Text variant="subheader-2">Тема</Text>
            <Text variant="body-2" color="secondary">
              Выбранная тема сохраняется в localStorage и восстанавливается при перезагрузке.
            </Text>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}
