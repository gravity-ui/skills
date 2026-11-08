import { useSyncExternalStore } from 'react';

export const ROUTES = [
  { path: '/', title: 'Главная' },
  { path: '/tasks', title: 'Задачи' },
  { path: '/about', title: 'О приложении' },
] as const;

export type RoutePath = (typeof ROUTES)[number]['path'];

function currentPath(): RoutePath {
  const hash = window.location.hash.replace(/^#/, '') || '/';
  return (ROUTES.find((r) => r.path === hash)?.path ?? '/') as RoutePath;
}

function subscribe(cb: () => void) {
  window.addEventListener('hashchange', cb);
  return () => window.removeEventListener('hashchange', cb);
}

export function useRoute(): RoutePath {
  return useSyncExternalStore(subscribe, currentPath);
}

export const href = (path: RoutePath) => `#${path}`;
