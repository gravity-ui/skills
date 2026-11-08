export type AppTheme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'app-theme';
export const DEFAULT_APP_THEME: AppTheme = 'light';

export function isAppTheme(value: unknown): value is AppTheme {
  return value === 'light' || value === 'dark';
}

// localStorage может быть недоступен (приватный режим, запрет cookies) или содержать
// некорректное значение — в этих случаях тихо возвращаем тему по умолчанию.
export function loadStoredTheme(): AppTheme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(stored) ? stored : DEFAULT_APP_THEME;
  } catch {
    return DEFAULT_APP_THEME;
  }
}

export function saveTheme(theme: AppTheme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Хранилище недоступно — тема останется действующей до перезагрузки.
  }
}
