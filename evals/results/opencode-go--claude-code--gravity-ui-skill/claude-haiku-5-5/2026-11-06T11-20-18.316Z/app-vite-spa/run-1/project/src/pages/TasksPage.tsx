import * as React from 'react';
import { Box, Button, Checkbox, Flex, Text, TextInput } from '@gravity-ui/uikit';

type Task = {
  id: number;
  title: string;
  done: boolean;
};

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Изучить компоненты Gravity UI', done: true },
  { id: 2, title: 'Добавить новую страницу', done: false },
  { id: 3, title: 'Проверить тёмную тему', done: false },
];

export function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [draft, setDraft] = React.useState('');
  const nextId = React.useRef(INITIAL_TASKS.length + 1);

  const addTask = () => {
    const title = draft.trim();
    if (!title) {
      return;
    }
    const id = nextId.current++;
    setTasks((prev) => [...prev, { id, title, done: false }]);
    setDraft('');
  };

  const toggleTask = (id: number, done: boolean) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done } : task)));
  };

  return (
    <Box spacing={{ p: 6 }}>
      <Flex direction="column" gap={4}>
        <Text variant="header-1">Задачи</Text>

        <Flex gap={2} alignItems="center">
          <div style={{ flex: 1, minWidth: 0 }}>
            <TextInput
              value={draft}
              placeholder="Новая задача"
              onUpdate={setDraft}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  addTask();
                }
              }}
            />
          </div>
          <Button view="action" size="m" onClick={addTask} style={{ flexShrink: 0 }}>
            Добавить
          </Button>
        </Flex>

        {tasks.length === 0 ? (
          <Text variant="body-2" color="hint">
            Задач пока нет
          </Text>
        ) : (
          <Flex direction="column" gap={3}>
            {tasks.map((task) => (
              <Checkbox
                key={task.id}
                size="l"
                checked={task.done}
                onUpdate={(done) => toggleTask(task.id, done)}
                content={
                  <Text
                    variant="body-2"
                    color={task.done ? 'hint' : 'primary'}
                    style={{ textDecoration: task.done ? 'line-through' : undefined }}
                  >
                    {task.title}
                  </Text>
                }
              />
            ))}
          </Flex>
        )}
      </Flex>
    </Box>
  );
}
