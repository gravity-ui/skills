export interface Task {
  id: number;
  title: string;
  done: boolean;
}

export const TASKS: Task[] = [
  { id: 1, title: 'Подготовить макеты главной страницы', done: true },
  { id: 2, title: 'Настроить светлую и тёмную темы', done: true },
  { id: 3, title: 'Добавить навигацию между страницами', done: false },
  { id: 4, title: 'Написать документацию для команды', done: false },
];
