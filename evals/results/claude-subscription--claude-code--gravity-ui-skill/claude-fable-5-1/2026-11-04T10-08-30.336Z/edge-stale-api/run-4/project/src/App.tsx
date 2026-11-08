import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { ThemeToggle } from './ThemeToggle';

export function App() {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 640 }}>
      <Flex alignItems="center" justifyContent="space-between" gap={3}>
        <Text variant="header-1">Переключатель темы</Text>
        <ThemeToggle />
      </Flex>

      <Card view="filled" style={{ padding: 16 }}>
        <Flex direction="column" gap={3}>
          <Text variant="body-2">
            Тема применяется ко всей странице через класс на <code>body</code>, выбор сохраняется между
            перезагрузками. По умолчанию используется системная тема.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action">Action</Button>
            <Button view="normal">Normal</Button>
            <Button view="outlined">Outlined</Button>
            <Button view="flat">Flat</Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}
