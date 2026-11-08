export const SUPPORTED_LANGS = ['en', 'ru'] as const;

export type AppLang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: AppLang = 'en';

export const LANG_STORAGE_KEY = 'app.lang';

export function isAppLang(value: unknown): value is AppLang {
  return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}
