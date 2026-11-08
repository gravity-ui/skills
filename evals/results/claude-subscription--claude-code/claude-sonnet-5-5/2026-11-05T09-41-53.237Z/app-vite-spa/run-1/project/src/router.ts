import { useEffect, useState } from 'react';

export type Route = 'home' | 'tasks' | 'about';

export const ROUTES: {id: Route; path: string; title: string}[] = [
  { id: 'home', path: '/', title: 'Главная' },
  { id: 'tasks', path: '/tasks', title: 'Задачи' },
  { id: 'about', path: '/about', title: 'О приложении' },
];

function currentPath(): string {
  return window.location.hash.replace(/^#/, '') || '/';
}

/** Минимальный hash-роутер: ссылки вида #/tasks, работает без настройки сервера. */
export function useRoute(): Route {
  const [path, setPath] = useState(currentPath);

  useEffect(() => {
    const onChange = () => setPath(currentPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return ROUTES.find((r) => r.path === path)?.id ?? 'home';
}
