import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Checkbox, Text, TextInput } from '@gravity-ui/uikit';

interface Task {
  id: string;
  text: string;
  done: boolean;
}

const STORAGE_KEY = 'app-tasks';

function isTask(value: unknown): value is Task {
  if (typeof value !== 'object' || value === null) return false;
  const task = value as Record<string, unknown>;
  return typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean';
}

function loadTasks(): Task[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(isTask) : [];
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
      // Ignore: tasks still work for this session.
    }
  }, [tasks]);

  const doneCount = tasks.filter((task) => task.done).length;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTasks((prev) => [...prev, { id, text, done: false }]);
    setDraft('');
  }

  function setTaskDone(id: string, done: boolean) {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done } : task)));
  }

  function removeTask(id: string) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function clearDone() {
    setTasks((prev) => prev.filter((task) => !task.done));
  }

  return (
    <section className="page">
      <Text as="h1" variant="header-1">
        Задачи
      </Text>

      <form className="task-form" onSubmit={addTask}>
        <TextInput
          className="task-form__input"
          size="l"
          placeholder="Что нужно сделать?"
          value={draft}
          onUpdate={setDraft}
        />
        <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
          Добавить
        </Button>
      </form>

      {tasks.length === 0 ? (
        <Text as="p" variant="body-2" color="secondary">
          Задач пока нет. Добавьте первую!
        </Text>
      ) : (
        <>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={task.done ? 'task-item task-item--done' : 'task-item'}>
                <Checkbox
                  className="task-item__check"
                  size="l"
                  checked={task.done}
                  onUpdate={(done) => setTaskDone(task.id, done)}
                  content={<span className="task-item__text">{task.text}</span>}
                />
                <Button
                  view="flat-danger"
                  size="s"
                  onClick={() => removeTask(task.id)}
                  aria-label={`Удалить задачу: ${task.text}`}
                >
                  Удалить
                </Button>
              </li>
            ))}
          </ul>

          <div className="task-footer">
            <Text variant="body-2">
              Выполнено: {doneCount} из {tasks.length}
            </Text>
            {doneCount > 0 && (
              <Button view="flat" size="s" onClick={clearDone}>
                Очистить выполненные
              </Button>
            )}
          </div>
        </>
      )}
    </section>
  );
}
