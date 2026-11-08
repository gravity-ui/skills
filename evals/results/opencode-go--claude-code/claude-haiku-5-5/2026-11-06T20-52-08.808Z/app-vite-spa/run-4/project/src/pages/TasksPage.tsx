import { useEffect, useState } from 'react';
import { Button, Card, Checkbox, Text, TextInput } from '@gravity-ui/uikit';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = 'app-tasks';

function loadTasks(): Task[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as Task[]) : [];
  } catch {
    return [];
  }
}

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // Storage unavailable; tasks still work for this session.
    }
  }, [tasks]);

  const addTask = () => {
    const text = draft.trim();
    if (!text) return;
    setTasks((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, done: false }]);
    setDraft('');
  };

  const toggleTask = (id: string) =>
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done: !task.done } : task)));

  const removeTask = (id: string) => setTasks((prev) => prev.filter((task) => task.id !== id));

  const left = tasks.filter((task) => !task.done).length;

  return (
    <Card view="outlined" size="l" className="page-card">
      <Text variant="header-2" as="h1">
        Задачи
      </Text>
      <div className="task-add">
        <TextInput
          size="l"
          placeholder="Новая задача"
          value={draft}
          onUpdate={setDraft}
          onKeyDown={(event) => {
            if (event.key === 'Enter') addTask();
          }}
          className="task-input"
        />
        <Button view="action" size="l" onClick={addTask} disabled={!draft.trim()}>
          Добавить
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Text variant="body-2" color="secondary">
          Задач пока нет.
        </Text>
      ) : (
        <>
          <Text variant="caption-2" color="secondary">
            Не выполнено: {left} из {tasks.length}
          </Text>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className="task-item">
                <Checkbox size="l" checked={task.done} onUpdate={() => toggleTask(task.id)} content={task.text} />
                <Button view="flat" size="m" onClick={() => removeTask(task.id)} aria-label="Удалить задачу">
                  Удалить
                </Button>
              </li>
            ))}
          </ul>
        </>
      )}
    </Card>
  );
}
