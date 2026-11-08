import { useCallback, useState } from 'react';

export function useLocalStorage<T>(key: string, initial: () => T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw !== null) return JSON.parse(raw) as T;
    } catch {
      // повреждённое значение или недоступный storage — берём значение по умолчанию
    }
    return initial();
  });

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // storage может быть недоступен (приватный режим) — не критично
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, set] as const;
}
