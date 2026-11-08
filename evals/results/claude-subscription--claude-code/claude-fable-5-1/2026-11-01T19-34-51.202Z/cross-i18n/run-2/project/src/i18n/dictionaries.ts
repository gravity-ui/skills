import type { AppLang } from './types';
import { en, type Dictionary, type TranslationKey } from './en';
import { ru } from './ru';

export const dictionaries: Record<AppLang, Dictionary> = { en, ru };

export type TranslateParams = Record<string, string | number>;

export function translate(lang: AppLang, key: TranslationKey, params?: TranslateParams): string {
  const template = dictionaries[lang][key] ?? dictionaries.en[key] ?? key;
  if (!params) {
    return template;
  }
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
