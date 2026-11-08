import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import type { PageId } from '../router';
import { TASKS } from './tasks';

type Props = {
  onNavigate: (page: PageId) => void;
};

export function HomePage({ onNavigate }: Props) {
  const done = TASKS.filter((task) => task.status === 'done').length;
  const inProgress = TASKS.filter((task) => task.status === 'in-progress').length;
  const todo = TASKS.length - done - inProgress;

  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1">Главная</Text>
        <Text variant="body-2" color="secondary">
          Небольшое приложение на Gravity UI: три страницы, боковая навигация и переключатель темы.
        </Text>
      </Flex>

      <Flex gap={4} wrap>
        <StatCard title="Всего задач" value={TASKS.length} />
        <StatCard title="В работе" value={inProgress} />
        <StatCard title="Выполнено" value={done} />
        <StatCard title="Не начато" value={todo} />
      </Flex>

      <Card type="container" view="filled" spacing={{ p: 5 }}>
        <Flex direction="column" gap={3}>
          <Text variant="subheader-2">Куда дальше</Text>
          <Text variant="body-1" color="secondary">
            Список задач живёт на отдельной странице, а тема переключается в настройках или кнопкой
            внизу боковой панели.
          </Text>
          <Flex gap={2} wrap>
            <Button view="action" size="l" onClick={() => onNavigate('tasks')}>
              Открыть задачи
            </Button>
            <Button view="outlined" size="l" onClick={() => onNavigate('settings')}>
              Настройки
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <Card type="container" view="outlined" spacing={{ p: 4 }} style={{ flex: '1 1 160px', minWidth: 0 }}>
      <Flex direction="column" gap={1}>
        <Text variant="caption-2" color="secondary">
          {title}
        </Text>
        <Text variant="display-1">{value}</Text>
      </Flex>
    </Card>
  );
}
