import React from 'react';

import {
  THEME_STORAGE_KEY,
  isAppTheme,
  readStoredTheme,
  writeStoredTheme,
  type AppTheme,
} from './themeStorage';

/**
 * Тема приложения, синхронизированная с localStorage.
 * Начальное значение читается синхронно в инициализаторе useState,
 * поэтому первый рендер уже идёт в правильной теме и после перезагрузки нет мигания.
 */
export function useStoredTheme(): [AppTheme, (theme: AppTheme) => void] {
  const [theme, setThemeState] = React.useState<AppTheme>(() => readStoredTheme());

  const setTheme = React.useCallback((next: AppTheme) => {
    setThemeState(next);
    writeStoredTheme(next);
  }, []);

  // Если тему поменяли в другой вкладке, подхватываем изменение.
  React.useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      setThemeState(isAppTheme(event.newValue) ? event.newValue : readStoredTheme());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [theme, setTheme];
}
