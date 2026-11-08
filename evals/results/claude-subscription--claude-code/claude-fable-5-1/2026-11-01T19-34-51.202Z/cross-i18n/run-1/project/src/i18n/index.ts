import {en} from './en';
import type {TranslationKey} from './en';
import {ru} from './ru';

export type {TranslationKey};

export const LANGUAGES = ['en', 'ru'] as const;
export type Lang = (typeof LANGUAGES)[number];

export const DEFAULT_LANG: Lang = 'en';
export const LANG_STORAGE_KEY = 'app.lang';

export const dictionaries: Record<Lang, Record<TranslationKey, string>> = {en, ru};

export type TranslateParams = Record<string, string | number>;

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Looks up `key` in the dictionary for `lang`, falls back to English,
 * and finally to the key itself. `{placeholders}` are replaced with values from `params`.
 */
export function translate(lang: Lang, key: TranslationKey, params?: TranslateParams): string {
  const template = dictionaries[lang]?.[key] ?? dictionaries[DEFAULT_LANG][key] ?? key;
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

/** Reads the saved language, otherwise picks one from the browser settings. */
export function detectInitialLang(
  storage: Pick<Storage, 'getItem'> | undefined = typeof localStorage === 'undefined'
    ? undefined
    : localStorage,
  navigatorLanguages: readonly string[] = typeof navigator === 'undefined'
    ? []
    : navigator.languages ?? [navigator.language],
): Lang {
  try {
    const saved = storage?.getItem(LANG_STORAGE_KEY);
    if (isLang(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (private mode, disabled storage) — ignore.
  }

  for (const tag of navigatorLanguages) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) {
      return base;
    }
  }

  return DEFAULT_LANG;
}
