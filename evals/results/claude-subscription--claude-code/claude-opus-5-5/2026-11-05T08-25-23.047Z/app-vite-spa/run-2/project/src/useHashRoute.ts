import { useEffect, useState } from 'react';

/** Текущий путь из хэша: `#/tasks` → `/tasks`, пустой хэш → `/`. */
function readPath(): string {
  const path = window.location.hash.replace(/^#/, '');
  return path.startsWith('/') ? path : '/';
}

/**
 * Минимальный хэш-роутер: без зависимостей, работает на любом статическом
 * хостинге, кнопки «назад/вперёд» браузера поддерживаются из коробки.
 */
export function useHashRoute(): string {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => {
      setPath(readPath());
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return path;
}
