import { useRef, useState, type FormEvent } from 'react';
import { Button, Checkbox, Text, TextInput } from '@gravity-ui/uikit';

interface Task {
  id: number;
  title: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Открыть приложение', done: true },
  { id: 2, title: 'Переключить тему', done: false },
];

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [draft, setDraft] = useState('');
  const nextId = useRef(INITIAL_TASKS.length + 1);

  const addTask = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;

    const id = nextId.current++;
    setTasks((prev) => [...prev, { id, title, done: false }]);
    setDraft('');
  };

  const toggleTask = (id: number, done: boolean) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, done } : task)));
  };

  const removeTask = (id: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  return (
    <section>
      <Text as="h1" variant="display-2">
        Задачи
      </Text>

      <form className="task-form" onSubmit={addTask}>
        <TextInput
          className="task-form__input"
          size="l"
          placeholder="Новая задача"
          value={draft}
          onUpdate={setDraft}
        />
        <Button type="submit" size="l" view="action" disabled={!draft.trim()}>
          Добавить
        </Button>
      </form>

      {tasks.length === 0 ? (
        <Text as="p" className="task-list__empty">
          Задач пока нет.
        </Text>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-list__item">
              <Checkbox
                size="l"
                checked={task.done}
                onUpdate={(done) => toggleTask(task.id, done)}
                content={
                  <span className={task.done ? 'task-list__title--done' : undefined}>
                    {task.title}
                  </span>
                }
              />
              <Button size="m" view="flat" onClick={() => removeTask(task.id)}>
                Удалить
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
