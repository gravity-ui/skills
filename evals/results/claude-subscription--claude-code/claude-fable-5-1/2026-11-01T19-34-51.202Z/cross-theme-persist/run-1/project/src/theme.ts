import * as React from 'react';

/** Ключ в localStorage, под которым хранится выбранная тема. */
export const THEME_STORAGE_KEY = 'theme';

/** Темы, доступные в переключателе. `system` следует за настройкой ОС. */
export const APP_THEMES = ['light', 'dark', 'system'] as const;
export type AppTheme = (typeof APP_THEMES)[number];

/** Тема по умолчанию, если в localStorage ничего нет или значение невалидно. */
export const DEFAULT_APP_THEME: AppTheme = 'light';

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

function getStorage(): Storage | null {
  // localStorage может отсутствовать (SSR) или бросать исключение
  // (например, отключён в настройках браузера или приватный режим Safari).
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Читает сохранённую тему. Невалидное или отсутствующее значение → тема по умолчанию. */
export function readStoredTheme(): AppTheme {
  try {
    const stored = getStorage()?.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_APP_THEME;
  } catch {
    return DEFAULT_APP_THEME;
  }
}

/** Сохраняет тему. Ошибки записи (квота, отключённое хранилище) не ломают приложение. */
export function writeStoredTheme(theme: AppTheme): void {
  try {
    getStorage()?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Хранилище недоступно — тема просто не переживёт перезагрузку.
  }
}

/**
 * Состояние темы, которое сохраняется в localStorage и восстанавливается
 * при следующей загрузке страницы. Изменения в других вкладках подхватываются
 * через событие `storage`.
 */
export function usePersistedTheme(): [AppTheme, (theme: AppTheme) => void] {
  // Ленивый инициализатор: читаем хранилище один раз при первом рендере,
  // чтобы страница сразу открылась в сохранённой теме без «мигания».
  const [theme, setThemeState] = React.useState<AppTheme>(readStoredTheme);

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    function onStorage(event: StorageEvent) {
      if (event.key !== null && event.key !== THEME_STORAGE_KEY) return;
      setThemeState(readStoredTheme());
    }

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [theme, setTheme];
}
