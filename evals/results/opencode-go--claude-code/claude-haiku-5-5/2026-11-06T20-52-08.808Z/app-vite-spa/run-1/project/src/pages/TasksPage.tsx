import { useEffect, useState, type FormEvent } from 'react';
import { Button, Checkbox, Flex, Text, TextInput } from '@gravity-ui/uikit';

type Task = { id: string; title: string; done: boolean };

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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setTasks((prev) => [...prev, { id, title, done: false }]);
    setDraft('');
  };

  const setDone = (id: string, done: boolean) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));

  const removeTask = (id: string) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const left = tasks.filter((t) => !t.done).length;

  return (
    <Flex direction="column" gap={4}>
      <Text as="h1" variant="display-1">
        Задачи
      </Text>

      <form onSubmit={addTask}>
        <Flex gap={2}>
          <div style={{ flex: 1 }}>
            <TextInput
              size="l"
              placeholder="Что нужно сделать?"
              value={draft}
              onUpdate={setDraft}
            />
          </div>
          <Button type="submit" view="action" size="l">
            Добавить
          </Button>
        </Flex>
      </form>

      {tasks.length === 0 ? (
        <Text color="secondary">Задач пока нет.</Text>
      ) : (
        <>
          <Flex direction="column" gap={2}>
            {tasks.map((task) => (
              <Flex key={task.id} justifyContent="space-between" alignItems="center" gap={2}>
                <Checkbox
                  size="l"
                  checked={task.done}
                  onUpdate={(done) => setDone(task.id, done)}
                  content={task.title}
                />
                <Button view="flat" size="s" onClick={() => removeTask(task.id)}>
                  Удалить
                </Button>
              </Flex>
            ))}
          </Flex>
          <Text variant="body-2" color="secondary">
            Осталось: {left} из {tasks.length}
          </Text>
        </>
      )}
    </Flex>
  );
}
