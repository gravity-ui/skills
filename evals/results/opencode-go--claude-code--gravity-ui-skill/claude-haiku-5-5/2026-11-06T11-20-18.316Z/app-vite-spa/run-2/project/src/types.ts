export type PageId = 'home' | 'tasks' | 'settings';

export type ThemeMode = 'light' | 'dark';

export interface Task {
  id: number;
  title: string;
  done: boolean;
}
