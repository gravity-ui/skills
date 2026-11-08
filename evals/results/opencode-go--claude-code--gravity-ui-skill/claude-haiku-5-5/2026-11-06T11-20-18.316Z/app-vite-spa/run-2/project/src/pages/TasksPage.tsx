import { useState, type FormEvent } from 'react';
import { Button, Checkbox, Flex, Text, TextInput } from '@gravity-ui/uikit';

import type { Task } from '../types';

interface TasksPageProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: number) => void;
}

export function TasksPage({ tasks, onAdd, onToggle }: TasksPageProps) {
  const [draft, setDraft] = useState('');

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    onAdd(title);
    setDraft('');
  };

  return (
    <Flex direction="column" gap={5}>
      <Text variant="header-1">Задачи</Text>

      <form onSubmit={submit}>
        <Flex gap={2} alignItems="center">
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextInput
              size="l"
              placeholder="Новая задача"
              value={draft}
              onUpdate={setDraft}
            />
          </div>
          <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
            Добавить
          </Button>
        </Flex>
      </form>

      <Flex direction="column" gap={3}>
        {tasks.map((task) => (
          <Checkbox
            key={task.id}
            size="l"
            checked={task.done}
            onUpdate={() => onToggle(task.id)}
            content={task.title}
          />
        ))}
      </Flex>

      <Text variant="caption-2" color="secondary">
        Выполнено: {tasks.filter((task) => task.done).length} из {tasks.length}
      </Text>
    </Flex>
  );
}
