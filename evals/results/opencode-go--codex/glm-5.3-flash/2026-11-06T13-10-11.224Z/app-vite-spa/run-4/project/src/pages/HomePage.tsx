import { Card, Flex, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Flex direction="column" gap="4">
      <Text variant="header-1" as="h1">
        Добро пожаловать
      </Text>
      <Text variant="body-1" color="secondary">
        Небольшое приложение с тремя страницами, переключением темы и сохранением выбора.
      </Text>
      <Card view="filled" spacing={{ p: 4 }}>
        <Flex direction="column" gap="2">
          <Text variant="subheader-2" as="h2">
            Что здесь есть
          </Text>
          <Text variant="body-2" color="secondary">
            Навигация по вкладкам, светлый и тёмный режим, а также страницы с краткими примерами.
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
