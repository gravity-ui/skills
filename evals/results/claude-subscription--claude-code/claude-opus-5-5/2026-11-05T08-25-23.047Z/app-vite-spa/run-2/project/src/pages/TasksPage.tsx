import { Plus, TrashBin } from '@gravity-ui/icons';
import { Button, Checkbox, Flex, Icon, Text, TextInput } from '@gravity-ui/uikit';
import { useState, type FormEvent } from 'react';

type Task = { id: number; title: string; done: boolean };

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Посмотреть главную страницу', done: true },
  { id: 2, title: 'Переключить тему на тёмную', done: false },
  { id: 3, title: 'Добавить свою задачу', done: false },
];

export function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [draft, setDraft] = useState('');

  const addTask = (event: FormEvent) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setTasks((prev) => [...prev, { id: Date.now(), title, done: false }]);
    setDraft('');
  };

  const toggleTask = (id: number, done: boolean) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done } : t)));

  const removeTask = (id: number) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <Flex direction="column" gap={6}>
      <Flex direction="column" gap={2}>
        <Text as="h1" variant="display-1">
          Задачи
        </Text>
        <Text variant="body-2" color="secondary">
          Выполнено {doneCount} из {tasks.length}
        </Text>
      </Flex>

      <form onSubmit={addTask}>
        <Flex gap={2}>
          <TextInput
            size="l"
            placeholder="Новая задача"
            value={draft}
            onUpdate={setDraft}
            controlProps={{ 'aria-label': 'Название новой задачи' }}
          />
          <Button type="submit" view="action" size="l" disabled={!draft.trim()}>
            <Icon data={Plus} />
            Добавить
          </Button>
        </Flex>
      </form>

      {tasks.length === 0 ? (
        <Text color="secondary">Список пуст — добавьте первую задачу.</Text>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-list__item">
              <Checkbox
                size="l"
                checked={task.done}
                onUpdate={(done) => toggleTask(task.id, done)}
              >
                <span className={task.done ? 'task-list__done' : undefined}>{task.title}</span>
              </Checkbox>
              <Button
                view="flat-secondary"
                onClick={() => removeTask(task.id)}
                aria-label={`Удалить «${task.title}»`}
                title="Удалить"
              >
                <Icon data={TrashBin} />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Flex>
  );
}
