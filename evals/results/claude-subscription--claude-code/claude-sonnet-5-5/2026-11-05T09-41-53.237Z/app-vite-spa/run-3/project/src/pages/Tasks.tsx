import { useState, type FormEvent } from 'react';
import { Button, Card, Checkbox, Text, TextInput } from '@gravity-ui/uikit';

import { useLocalStorage } from '../useLocalStorage';

interface Task {
  id: number;
  text: string;
  done: boolean;
}

export function Tasks() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', () => []);
  const [text, setText] = useState('');

  const add = (e: FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setTasks((prev) => [...prev, { id: Date.now(), text: value, done: false }]);
    setText('');
  };

  const toggle = (id: number) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const remove = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const left = tasks.filter((t) => !t.done).length;

  return (
    <>
      <Text variant="display-1">Задачи</Text>
      <form className="tasks__form" onSubmit={add}>
        <TextInput
          value={text}
          onUpdate={setText}
          placeholder="Что нужно сделать?"
          size="l"
          controlProps={{ 'aria-label': 'Новая задача' }}
        />
        <Button type="submit" view="action" size="l" disabled={!text.trim()}>
          Добавить
        </Button>
      </form>

      {tasks.length === 0 ? (
        <Text color="secondary">Пока пусто — добавьте первую задачу.</Text>
      ) : (
        <>
          <Text color="secondary">Осталось: {left} из {tasks.length}</Text>
          <ul className="tasks__list">
            {tasks.map((t) => (
              <li key={t.id}>
                <Card view="outlined" type="container" className="tasks__item" style={{ padding: 12 }}>
                  <Checkbox checked={t.done} onUpdate={() => toggle(t.id)} size="l">
                    <span style={{ textDecoration: t.done ? 'line-through' : undefined }}>
                      {t.text}
                    </span>
                  </Checkbox>
                  <Button view="flat-danger" onClick={() => remove(t.id)} aria-label="Удалить задачу">
                    Удалить
                  </Button>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
