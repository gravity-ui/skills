import { useCallback, useState } from 'react';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}

const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Изучить компоненты Gravity UI', done: true },
  { id: 2, title: 'Настроить навигацию', done: true },
  { id: 3, title: 'Добавить переключатель темы', done: false },
];

let lastId = INITIAL_TASKS.length;

/** In-memory task list. Lives in App so it survives navigating between pages. */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);

  const addTask = useCallback((title: string) => {
    lastId += 1;
    const id = lastId;
    setTasks((prev) => [...prev, { id, title, done: false }]);
  }, []);

  const toggleTask = useCallback((id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }, []);

  const removeTask = useCallback((id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { tasks, addTask, toggleTask, removeTask };
}
