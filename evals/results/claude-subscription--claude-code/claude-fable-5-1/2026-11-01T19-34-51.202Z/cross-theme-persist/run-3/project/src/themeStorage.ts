import type { Theme } from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

export const THEME_OPTIONS = ['light', 'dark', 'system'] as const satisfies readonly Theme[];
export type AppTheme = (typeof THEME_OPTIONS)[number];

export const DEFAULT_APP_THEME: AppTheme = 'system';

export function isAppTheme(value: unknown): value is AppTheme {
  return typeof value === 'string' && (THEME_OPTIONS as readonly string[]).includes(value);
}

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

function getStorage(): StorageLike | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Доступ к localStorage может бросить исключение (например, при запрете cookies).
    return null;
  }
}

/** Читает сохранённую тему; при отсутствии или мусоре в хранилище возвращает тему по умолчанию. */
export function readStoredTheme(storage: StorageLike | null = getStorage()): AppTheme {
  if (!storage) return DEFAULT_APP_THEME;
  try {
    const raw = storage.getItem(THEME_STORAGE_KEY);
    return isAppTheme(raw) ? raw : DEFAULT_APP_THEME;
  } catch {
    return DEFAULT_APP_THEME;
  }
}

/** Сохраняет тему. Ошибки записи (переполнение, приватный режим) глотаются: тема всё равно применится в текущей сессии. */
export function writeStoredTheme(theme: AppTheme, storage: StorageLike | null = getStorage()): void {
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }
}
