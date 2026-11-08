import type { Theme } from '@gravity-ui/uikit';

/** Ключ, под которым выбранная тема хранится в localStorage. */
export const THEME_STORAGE_KEY = 'app-theme';

/** Значения, которые разрешено сохранять и восстанавливать. */
export const APP_THEMES = ['light', 'dark', 'system'] as const;

export type AppTheme = (typeof APP_THEMES)[number];

export const DEFAULT_APP_THEME: AppTheme = 'light';

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (APP_THEMES as readonly string[]).includes(value);
}

/**
 * Безопасный доступ к localStorage: в приватном режиме Safari, при отключённых
 * cookie или в SSR обращение к `window.localStorage` может бросить исключение.
 */
function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

/** Читает сохранённую тему; при отсутствии или мусорном значении возвращает `fallback`. */
export function readStoredTheme(
  fallback: AppTheme = DEFAULT_APP_THEME,
  storage: Storage | null = getStorage(),
): AppTheme {
  try {
    const raw = storage?.getItem(THEME_STORAGE_KEY);
    return isAppTheme(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

/** Сохраняет тему. Ошибки записи (квота, запрет) молча игнорируются. */
export function writeStoredTheme(theme: AppTheme, storage: Storage | null = getStorage()): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Невозможность сохранить тему не должна ломать приложение.
  }
}

/** Тип uikit шире (`StringWithSuggest`), поэтому явно сужаем до поддерживаемых значений. */
export function toAppTheme(theme: Theme): AppTheme {
  return isAppTheme(theme) ? theme : DEFAULT_APP_THEME;
}
