import React from 'react';
import { Button, Card, Checkbox, Icon, Text, TextInput } from '@gravity-ui/uikit';
import { Plus, TrashBin } from '@gravity-ui/icons';

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Изучить структуру приложения', done: true },
  { id: 2, title: 'Переключить тёмную тему', done: false },
  { id: 3, title: 'Добавить свою первую задачу', done: false },
];

export function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [draft, setDraft] = React.useState('');

  const addTask = () => {
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);
    setDraft('');
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <Text variant="header-1">Задачи</Text>
        <div style={{ marginTop: 8 }}>
          <Text variant="body-2" color="secondary">
            Выполнено {doneCount} из {tasks.length}
          </Text>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <TextInput
          placeholder="Новая задача…"
          value={draft}
          onUpdate={setDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') addTask();
          }}
          size="l"
        />
        <Button view="action" size="l" onClick={addTask} disabled={!draft.trim()}>
          <Icon data={Plus} size={16} />
          Добавить
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {tasks.length === 0 && (
          <Card view="filled" style={{ padding: 20 }}>
            <Text color="secondary">Список пуст. Добавьте первую задачу выше.</Text>
          </Card>
        )}
        {tasks.map((task) => (
          <Card
            key={task.id}
            view="raised"
            style={{
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <Checkbox
              checked={task.done}
              onUpdate={() => toggleTask(task.id)}
              size="l"
            />
            <div style={{ flex: 1 }}>
              <Text
                variant="body-2"
                color={task.done ? 'secondary' : undefined}
                style={{ textDecoration: task.done ? 'line-through' : 'none' }}
              >
                {task.title}
              </Text>
            </div>
            <Button view="flat-danger" size="m" onClick={() => removeTask(task.id)} title="Удалить">
              <Icon data={TrashBin} size={16} />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
