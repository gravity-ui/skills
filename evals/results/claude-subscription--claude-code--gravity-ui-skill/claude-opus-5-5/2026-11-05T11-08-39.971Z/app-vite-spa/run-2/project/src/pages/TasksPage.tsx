import { useState } from 'react';
import { Card, Flex, Label, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

import { PageContainer } from './PageContainer';
import { TASKS } from './tasksData';

type Filter = 'all' | 'active' | 'done';

const FILTER_OPTIONS: { value: Filter; content: string }[] = [
  { value: 'all', content: 'Все' },
  { value: 'active', content: 'В работе' },
  { value: 'done', content: 'Выполненные' },
];

export function TasksPage() {
  const [filter, setFilter] = useState<Filter>('all');

  const visible = TASKS.filter((t) =>
    filter === 'all' ? true : filter === 'done' ? t.done : !t.done,
  );

  return (
    <PageContainer title="Задачи" description="Список текущих задач проекта.">
      <SegmentedRadioGroup<Filter>
        value={filter}
        onUpdate={setFilter}
        options={FILTER_OPTIONS}
        aria-label="Фильтр задач"
        style={{ alignSelf: 'flex-start' }}
      />

      <Flex direction="column" gap={2}>
        {visible.length === 0 ? (
          <Text variant="body-1" color="secondary">
            Нет задач в этой категории.
          </Text>
        ) : (
          visible.map((task) => (
            <Card key={task.id} view="outlined">
              <Flex
                alignItems="center"
                gap={3}
                style={{ padding: 'var(--g-spacing-3) var(--g-spacing-4)' }}
              >
                <Text variant="body-2" style={{ flex: 1, minWidth: 0 }} ellipsis>
                  {task.title}
                </Text>
                <span style={{ flexShrink: 0 }}>
                  <Label theme={task.done ? 'success' : 'info'}>
                    {task.done ? 'Выполнено' : 'В работе'}
                  </Label>
                </span>
              </Flex>
            </Card>
          ))
        )}
      </Flex>
    </PageContainer>
  );
}
