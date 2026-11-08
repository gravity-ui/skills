export type AppTheme = 'light' | 'dark' | 'system';

export const APP_THEMES: readonly AppTheme[] = ['light', 'dark', 'system'];

export const DEFAULT_APP_THEME: AppTheme = 'light';

export const THEME_STORAGE_KEY = 'app-theme';

function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

// localStorage может быть недоступен (приватный режим, sandboxed iframe) и
// кидать исключение — в этом случае работаем с темой по умолчанию.
export function loadTheme(): AppTheme {
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
    // Не удалось сохранить — тема всё равно применится в текущей сессии.
  }
}
