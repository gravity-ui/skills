import { type FormEvent, useState } from 'react';
import { Box, Button, Card, Checkbox, Flex, Icon, Text, TextInput } from '@gravity-ui/uikit';
import { Xmark } from '@gravity-ui/icons';

import type { Task } from '../tasks';

interface TasksPageProps {
  tasks: Task[];
  onAdd: (title: string) => void;
  onToggle: (id: number) => void;
  onRemove: (id: number) => void;
}

export function TasksPage({ tasks, onAdd, onToggle, onRemove }: TasksPageProps) {
  const [draft, setDraft] = useState('');
  const doneCount = tasks.filter((t) => t.done).length;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) {
      return;
    }
    onAdd(title);
    setDraft('');
  };

  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4} style={{ maxWidth: 720 }}>
        <Text variant="header-1">Задачи</Text>

        <form onSubmit={handleSubmit}>
          <Flex gap={2} alignItems="center">
            <Box style={{ flex: 1, minWidth: 0 }}>
              <TextInput
                size="l"
                value={draft}
                onUpdate={setDraft}
                placeholder="Новая задача"
                controlProps={{ 'aria-label': 'Новая задача' }}
              />
            </Box>
            <Box style={{ flexShrink: 0 }}>
              <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
                Добавить
              </Button>
            </Box>
          </Flex>
        </form>

        {tasks.length === 0 ? (
          <Text variant="body-2" color="secondary">
            Задач пока нет. Добавьте первую.
          </Text>
        ) : (
          <Flex direction="column" gap={2}>
            {tasks.map((task) => (
              <Card key={task.id} type="container" view="outlined" size="m">
                <Flex alignItems="center" gap={2}>
                  <Box style={{ flex: 1, minWidth: 0 }}>
                    <Checkbox
                      checked={task.done}
                      onUpdate={() => onToggle(task.id)}
                      content={
                        <span style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                          {task.title}
                        </span>
                      }
                    />
                  </Box>
                  <Box style={{ flexShrink: 0 }}>
                    <Button
                      view="flat"
                      size="m"
                      aria-label={`Удалить задачу: ${task.title}`}
                      onClick={() => onRemove(task.id)}
                    >
                      <Icon data={Xmark} size={16} />
                    </Button>
                  </Box>
                </Flex>
              </Card>
            ))}
          </Flex>
        )}

        <Text variant="body-2" color="secondary">
          Выполнено: {doneCount} из {tasks.length}
        </Text>
      </Flex>
    </Box>
  );
}
