import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import { pathOf } from '../routes';
import { TASKS } from './tasksData';
import { PageContainer } from './PageContainer';

export function HomePage() {
  const done = TASKS.filter((t) => t.done).length;
  const stats = [
    { label: 'Всего задач', value: TASKS.length },
    { label: 'Выполнено', value: done },
    { label: 'В работе', value: TASKS.length - done },
  ];

  return (
    <PageContainer
      title="Добро пожаловать"
      description="Небольшое приложение на Gravity UI: три страницы, боковая навигация и переключатель темы."
    >
      <Flex gap={4} wrap>
        {stats.map((s) => (
          <Card key={s.label} view="outlined" style={{ flex: '1 1 180px', minWidth: 0 }}>
            <Flex direction="column" gap={1} style={{ padding: 'var(--g-spacing-4)' }}>
              <Text variant="caption-2" color="secondary">
                {s.label}
              </Text>
              <Text variant="display-1">{s.value}</Text>
            </Flex>
          </Card>
        ))}
      </Flex>

      <Card view="filled">
        <Flex direction="column" gap={3} style={{ padding: 'var(--g-spacing-5)' }}>
          <Text variant="subheader-3">С чего начать</Text>
          <Text variant="body-1" color="complementary">
            Посмотрите список задач или настройте тему оформления. Тему также можно быстро
            переключить кнопкой внизу боковой панели.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action" size="l" href={pathOf('tasks')}>
              Открыть задачи
            </Button>
            <Button view="outlined" size="l" href={pathOf('settings')}>
              Настройки
            </Button>
          </Flex>
        </Flex>
      </Card>
    </PageContainer>
  );
}
