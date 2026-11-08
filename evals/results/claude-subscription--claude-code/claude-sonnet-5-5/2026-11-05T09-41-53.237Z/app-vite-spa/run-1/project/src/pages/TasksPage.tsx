import { useState } from 'react';
import { Button, Card, Checkbox, Text, TextInput } from '@gravity-ui/uikit';

type Task = { id: number; title: string; done: boolean };

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([
    { id: 1, title: 'Попробовать тёмную тему', done: false },
    { id: 2, title: 'Открыть страницу «О приложении»', done: false },
  ]);
  const [title, setTitle] = useState('');

  const add = () => {
    const value = title.trim();
    if (!value) return;
    setTasks((prev) => [...prev, { id: Date.now(), title: value, done: false }]);
    setTitle('');
  };

  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));

  return (
    <section className="page">
      <Text variant="display-1" as="h1">Задачи</Text>
      <form
        className="tasks__form"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <TextInput placeholder="Новая задача" value={title} onUpdate={setTitle} />
        <Button type="submit" view="action" disabled={!title.trim()}>Добавить</Button>
      </form>

      {tasks.length === 0 ? (
        <Text color="secondary">Задач нет — добавьте первую.</Text>
      ) : (
        <ul className="tasks__list">
          {tasks.map((t) => (
            <li key={t.id}>
              <Card view="outlined" type="container" className="tasks__item" style={{ padding: '8px 12px' }}>
                <Checkbox checked={t.done} onUpdate={() => toggle(t.id)}>
                  <span style={{ textDecoration: t.done ? 'line-through' : undefined }}>{t.title}</span>
                </Checkbox>
                <Button view="flat-danger" size="s" onClick={() => remove(t.id)}>Удалить</Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
