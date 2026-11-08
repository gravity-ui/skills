import { Card, Flex, Label, Text } from '@gravity-ui/uikit';

import { TASKS, type TaskStatus } from './tasks';

const STATUS_LABEL: Record<TaskStatus, { text: string; theme: 'normal' | 'info' | 'success' }> = {
  todo: { text: 'Не начато', theme: 'normal' },
  'in-progress': { text: 'В работе', theme: 'info' },
  done: { text: 'Выполнено', theme: 'success' },
};

export function TasksPage() {
  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text variant="header-1">Задачи</Text>
        <Text variant="body-2" color="secondary">
          Список задач команды и их текущий статус.
        </Text>
      </Flex>

      <Flex direction="column" gap={3}>
        {TASKS.map((task) => {
          const status = STATUS_LABEL[task.status];
          return (
            <Card key={task.id} type="container" view="outlined" spacing={{ p: 4 }}>
              <Flex alignItems="center" gap={3}>
                <Flex direction="column" gap={1} style={{ flex: 1, minWidth: 0 }}>
                  <Text variant="subheader-1" ellipsis>
                    {task.title}
                  </Text>
                  <Text variant="body-1" color="secondary">
                    Исполнитель: {task.owner}
                  </Text>
                </Flex>
                <div style={{ flexShrink: 0 }}>
                  <Label theme={status.theme} size="m">
                    {status.text}
                  </Label>
                </div>
              </Flex>
            </Card>
          );
        })}
      </Flex>
    </Flex>
  );
}
