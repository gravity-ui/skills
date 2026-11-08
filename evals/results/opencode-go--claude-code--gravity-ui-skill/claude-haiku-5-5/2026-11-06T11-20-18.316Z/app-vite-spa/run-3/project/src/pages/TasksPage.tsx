import React, { useEffect, useState } from 'react';
import { Box, Button, Card, Checkbox, Flex, Icon, Text, TextInput } from '@gravity-ui/uikit';
import { TrashBin } from '@gravity-ui/icons';

type Task = { id: string; title: string; done: boolean };

const STORAGE_KEY = 'app-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Task[]) : [];
  } catch {
    return [];
  }
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, title, done: false }]);
    setDraft('');
  };

  const updateTask = (id: string, patch: Partial<Task>) =>
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...patch } : task)));

  const removeTask = (id: string) => setTasks((prev) => prev.filter((task) => task.id !== id));

  return (
    <Flex direction="column" gap={4}>
      <Flex gap={2} alignItems="center">
        <Box style={{ flex: 1, minWidth: 0 }}>
          <TextInput
            size="l"
            placeholder="Новая задача"
            value={draft}
            onUpdate={setDraft}
            onKeyDown={(event) => {
              if (event.key === 'Enter') addTask();
            }}
          />
        </Box>
        <Button view="action" size="l" onClick={addTask} style={{ flexShrink: 0 }}>
          Добавить
        </Button>
      </Flex>

      {tasks.length === 0 ? (
        <Text variant="body-1">Задач пока нет. Добавьте первую.</Text>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} type="container" view="outlined" size="m" spacing={{ px: 4, py: 3 }}>
            <Flex alignItems="center" gap={3}>
              <Box style={{ flex: 1, minWidth: 0 }}>
                <Checkbox
                  size="l"
                  checked={task.done}
                  onUpdate={(done) => updateTask(task.id, { done })}
                  content={
                    <Text
                      variant="body-1"
                      style={{ textDecoration: task.done ? 'line-through' : 'none', wordBreak: 'break-word' }}
                    >
                      {task.title}
                    </Text>
                  }
                />
              </Box>
              <Button
                view="flat"
                size="m"
                onClick={() => removeTask(task.id)}
                aria-label={`Удалить задачу «${task.title}»`}
                style={{ flexShrink: 0 }}
              >
                <Icon data={TrashBin} size={16} />
              </Button>
            </Flex>
          </Card>
        ))
      )}
    </Flex>
  );
}
