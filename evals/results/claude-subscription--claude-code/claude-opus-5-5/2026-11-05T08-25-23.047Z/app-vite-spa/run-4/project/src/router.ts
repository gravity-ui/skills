import { useEffect, useState } from 'react';

function readPath(): string {
  const path = window.location.hash.replace(/^#/, '');
  return path === '' ? '/' : path;
}

/** Минимальный hash-роутер: возвращает текущий путь вида "/tasks". */
export function useHashPath(): string {
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

export function href(path: string): string {
  return `#${path}`;
}
