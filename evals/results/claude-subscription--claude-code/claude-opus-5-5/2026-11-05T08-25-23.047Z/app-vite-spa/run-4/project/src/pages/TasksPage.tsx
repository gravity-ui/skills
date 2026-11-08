import { useState } from 'react';
import { Button, Card, Checkbox, Flex, Text, TextInput } from '@gravity-ui/uikit';

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const initialTasks: Task[] = [
  { id: 1, title: 'Посмотреть главную страницу', done: true },
  { id: 2, title: 'Переключить тему', done: false },
  { id: 3, title: 'Добавить свою задачу', done: false },
];

export function TasksPage() {
  const [tasks, setTasks] = useState(initialTasks);
  const [draft, setDraft] = useState('');

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);
    setDraft('');
  };

  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Flex direction="column" gap={4}>
      <Flex direction="column" gap={1}>
        <Text variant="header-2">Задачи</Text>
        <Text color="secondary">
          Выполнено {doneCount} из {tasks.length}
        </Text>
      </Flex>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addTask();
        }}
      >
        <Flex gap={2}>
          <TextInput
            size="l"
            placeholder="Новая задача"
            value={draft}
            onUpdate={setDraft}
            controlProps={{ 'aria-label': 'Новая задача' }}
          />
          <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
            Добавить
          </Button>
        </Flex>
      </form>

      <Card view="outlined">
        {tasks.length === 0 ? (
          <Text as="div" color="secondary" className="task-empty">
            Список пуст
          </Text>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <Checkbox size="l" checked={task.done} onUpdate={() => toggle(task.id)}>
                  <Text color={task.done ? 'secondary' : 'primary'} className={task.done ? 'task-done' : undefined}>
                    {task.title}
                  </Text>
                </Checkbox>
                <Button view="flat-secondary" size="s" onClick={() => remove(task.id)}>
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Flex>
  );
}
