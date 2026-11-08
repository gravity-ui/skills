import { useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, TrashBin } from '@gravity-ui/icons';
import { Button, Card, Checkbox, Flex, Icon, Label, Text, TextInput } from '@gravity-ui/uikit';

import type { Task } from '../tasks';

interface TasksPageProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: number, done: boolean) => void;
  onRemove: (id: number) => void;
}

export function TasksPage({ tasks, onAdd, onToggle, onRemove }: TasksPageProps) {
  const [draft, setDraft] = useState('');
  const done = tasks.filter((task) => task.done).length;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) {
      return;
    }
    onAdd(title);
    setDraft('');
  };

  return (
    <Flex direction="column" gap={6}>
      <Flex alignItems="center" gap={3} wrap>
        <Text variant="header-1" as="h1">
          Задачи
        </Text>
        <Label theme={done === tasks.length && tasks.length > 0 ? 'success' : 'info'}>
          {done} из {tasks.length}
        </Label>
      </Flex>

      <form onSubmit={handleSubmit}>
        <Flex gap={2}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextInput
              size="l"
              value={draft}
              onUpdate={setDraft}
              placeholder="Новая задача"
              hasClear
            />
          </div>
          <Button type="submit" view="action" size="l" disabled={!draft.trim()} style={{ flexShrink: 0 }}>
            <Icon data={Plus} size={16} />
            Добавить
          </Button>
        </Flex>
      </form>

      <Card view="outlined">
        {tasks.length === 0 ? (
          <Flex direction="column" alignItems="center" gap={1} className="app-empty">
            <Text variant="subheader-2">Задач пока нет</Text>
            <Text color="secondary">Добавьте первую задачу в поле выше.</Text>
          </Flex>
        ) : (
          <ul className="app-task-list">
            {tasks.map((task) => (
              <li key={task.id} className="app-task">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <Checkbox
                    size="l"
                    checked={task.done}
                    onUpdate={(checked) => onToggle(task.id, checked)}
                    content={
                      <Text color={task.done ? 'secondary' : 'primary'} className="app-task__title">
                        {task.title}
                      </Text>
                    }
                  />
                </div>
                <Button
                  view="flat-secondary"
                  aria-label={`Удалить задачу «${task.title}»`}
                  onClick={() => onRemove(task.id)}
                  style={{ flexShrink: 0 }}
                >
                  <Icon data={TrashBin} size={16} />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Flex>
  );
}
