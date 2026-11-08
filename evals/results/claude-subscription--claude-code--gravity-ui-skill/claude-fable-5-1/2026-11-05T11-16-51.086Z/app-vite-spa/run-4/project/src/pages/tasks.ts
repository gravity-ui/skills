export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: number;
  title: string;
  owner: string;
  status: TaskStatus;
};

export const TASKS: Task[] = [
  { id: 1, title: 'Собрать каркас приложения', owner: 'Аня', status: 'done' },
  { id: 2, title: 'Подключить боковую навигацию', owner: 'Игорь', status: 'done' },
  { id: 3, title: 'Добавить переключатель темы', owner: 'Аня', status: 'in-progress' },
  { id: 4, title: 'Проверить контраст в тёмной теме', owner: 'Лена', status: 'in-progress' },
  { id: 5, title: 'Написать тесты роутера', owner: 'Игорь', status: 'todo' },
  { id: 6, title: 'Проверить вёрстку на 375px', owner: 'Лена', status: 'todo' },
];
