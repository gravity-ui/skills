import { Button, Flex, Text } from '@gravity-ui/uikit';

export function HomePage() {
  return (
    <Flex direction="column" gap={4}>
      <Text as="h1" variant="display-1">
        Добро пожаловать
      </Text>
      <Text variant="body-2" color="secondary">
        Небольшое приложение с навигацией между страницами и переключением светлой и тёмной темы.
      </Text>
      <Flex gap={2} wrap>
        <Button href="#/tasks" view="action" size="l">
          Открыть задачи
        </Button>
        <Button href="#/about" view="outlined" size="l">
          О приложении
        </Button>
      </Flex>
    </Flex>
  );
}
