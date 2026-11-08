import * as React from 'react';
import { Button, Card, Checkbox, Icon, Text, TextInput } from '@gravity-ui/uikit';
import { TrashBin } from '@gravity-ui/icons';

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Посмотреть главную страницу', done: true },
  { id: 2, title: 'Переключить тему', done: false },
  { id: 3, title: 'Добавить свою задачу', done: false },
];

export function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [draft, setDraft] = React.useState('');

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
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
    <section className="page">
      <Text variant="display-1" as="h1">
        Задачи
      </Text>
      <Text color="secondary">
        Выполнено {doneCount} из {tasks.length}
      </Text>

      <form className="tasks__form" onSubmit={addTask}>
        <TextInput
          size="l"
          placeholder="Новая задача"
          value={draft}
          onUpdate={setDraft}
          controlProps={{ 'aria-label': 'Название новой задачи' }}
        />
        <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
          Добавить
        </Button>
      </form>

      {tasks.length === 0 ? (
        <Text color="secondary">Список пуст.</Text>
      ) : (
        <ul className="tasks__list">
          {tasks.map((task) => (
            <li key={task.id}>
              <Card
                view="outlined"
                className={`tasks__item${task.done ? ' tasks__item_done' : ''}`}
              >
                <Checkbox size="l" checked={task.done} onUpdate={() => toggle(task.id)}>
                  {task.title}
                </Checkbox>
                <Button
                  view="flat"
                  onClick={() => remove(task.id)}
                  aria-label={`Удалить «${task.title}»`}
                  title="Удалить"
                >
                  <Icon data={TrashBin} />
                </Button>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
