import { Card, Flex, Text } from '@gravity-ui/uikit';

export function SettingsPage() {
  return (
    <Flex direction="column" gap="4">
      <Text variant="header-1" as="h1">
        Настройки
      </Text>
      <Text variant="body-1" color="secondary">
        Тему можно изменить кнопкой в шапке — она сразу применяется ко всем страницам.
      </Text>
      <Card view="filled" spacing={{ p: 4 }}>
        <Flex direction="column" gap="2">
          <Text variant="subheader-2" as="h2">
            Оформление
          </Text>
          <Text variant="body-2" color="secondary">
            Если выбор ещё не сохранён, приложение стартует с системной темы браузера.
          </Text>
        </Flex>
      </Card>
    </Flex>
  );
}
