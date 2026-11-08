import { Button, Card, Flex, Text } from '@gravity-ui/uikit';

import type { Task } from '../types';

interface HomePageProps {
  tasks: Task[];
  onOpenTasks: () => void;
}

export function HomePage({ tasks, onOpenTasks }: HomePageProps) {
  const done = tasks.filter((task) => task.done).length;
  const left = tasks.length - done;

  return (
    <Flex direction="column" gap={5}>
      <Text variant="header-1">Главная</Text>
      <Text variant="body-2" color="secondary">
        Небольшое демо на Gravity UI: навигация между страницами и переключение светлой и тёмной темы.
      </Text>

      <Flex gap={4} wrap>
        <StatCard label="Всего задач" value={tasks.length} />
        <StatCard label="Выполнено" value={done} />
        <StatCard label="Осталось" value={left} />
      </Flex>

      <div>
        <Button view="action" size="l" onClick={onOpenTasks}>
          Перейти к задачам
        </Button>
      </div>
    </Flex>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card view="outlined" size="l" spacing={{ p: 4 }} style={{ minWidth: 180 }}>
      <Flex direction="column" gap={2}>
        <Text variant="subheader-2" color="secondary">
          {label}
        </Text>
        <Text variant="display-1">{value}</Text>
      </Flex>
    </Card>
  );
}
