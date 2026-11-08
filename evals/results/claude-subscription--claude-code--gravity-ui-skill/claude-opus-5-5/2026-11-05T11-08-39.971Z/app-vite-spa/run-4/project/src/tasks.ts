export interface Task {
  id: number;
  title: string;
  done: boolean;
}

export const INITIAL_TASKS: Task[] = [
  { id: 1, title: 'Познакомиться с Gravity UI', done: true },
  { id: 2, title: 'Собрать навигацию на AsideHeader', done: true },
  { id: 3, title: 'Проверить тёмную тему', done: false },
  { id: 4, title: 'Добавить свою задачу', done: false },
];
