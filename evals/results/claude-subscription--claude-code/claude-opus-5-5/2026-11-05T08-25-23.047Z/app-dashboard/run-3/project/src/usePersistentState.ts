import * as React from 'react';

/** useState с сохранением в localStorage. `parse` получает распарсенный JSON (или undefined) и обязан вернуть валидное значение. */
export function usePersistentState<T>(key: string, parse: (raw: unknown) => T) {
    const [value, setValue] = React.useState<T>(() => {
        try {
            const raw = window.localStorage.getItem(key);
            return parse(raw === null ? undefined : JSON.parse(raw));
        } catch {
            return parse(undefined);
        }
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // Приватный режим / переполнение — просто не сохраняем.
        }
    }, [key, value]);

    return [value, setValue] as const;
}
