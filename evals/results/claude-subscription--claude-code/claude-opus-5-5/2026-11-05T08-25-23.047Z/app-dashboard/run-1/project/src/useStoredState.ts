import * as React from 'react';

/** useState с сохранением в localStorage. `parse` валидирует прочитанное значение. */
export function useStoredState<T>(key: string, initial: T | (() => T), parse?: (raw: unknown) => T) {
    const [value, setValue] = React.useState<T>(() => {
        try {
            const raw = window.localStorage.getItem(key);
            if (raw !== null) {
                const data: unknown = JSON.parse(raw);
                return parse ? parse(data) : (data as T);
            }
        } catch {
            // повреждённое значение или недоступный storage — используем дефолт
        }
        return typeof initial === 'function' ? (initial as () => T)() : initial;
    });

    React.useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(value));
        } catch {
            // квота / приватный режим — не критично
        }
    }, [key, value]);

    return [value, setValue] as const;
}
