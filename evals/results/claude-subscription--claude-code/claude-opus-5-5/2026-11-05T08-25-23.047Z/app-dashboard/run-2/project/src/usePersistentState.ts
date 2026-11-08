import { useEffect, useState } from 'react';

/**
 * useState, который переживает перезагрузку страницы. `parse` валидирует
 * сохранённое значение — в localStorage может лежать что угодно.
 */
export function usePersistentState<T>(
    key: string,
    initial: T | (() => T),
    parse: (raw: unknown) => T = (raw) => raw as T,
) {
    const [value, setValue] = useState<T>(() => {
        try {
            const raw = window.localStorage.getItem(key);
            if (raw !== null) return parse(JSON.parse(raw));
        } catch {
            // приватный режим / битый JSON — используем значение по умолчанию
        }
        return typeof initial === 'function' ? (initial as () => T)() : initial;
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // хранилище недоступно — состояние просто не сохранится
        }
    }, [key, value]);

    return [value, setValue] as const;
}
