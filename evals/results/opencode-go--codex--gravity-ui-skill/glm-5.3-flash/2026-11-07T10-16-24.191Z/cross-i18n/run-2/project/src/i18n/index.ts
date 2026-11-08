import {I18N} from '@gravity-ui/i18n';

import type {AppKeysets} from './keysets';
import {en, ru} from './keysets';

export const languages = [
  {code: 'en', name: 'English'},
  {code: 'ru', name: 'Русский'},
] as const;

export type AppLanguage = (typeof languages)[number]['code'];
export type AppTranslationKey = keyof AppKeysets['app'];

export const i18n = new I18N({
  lang: 'en',
  fallbackLang: 'en',
});

i18n.registerKeysets('en', {app: en.app});
i18n.registerKeysets('ru', {app: ru.app});

export function getAppKeyset(): (
  key: AppTranslationKey,
  params?: Record<string, unknown>,
) => string {
  return i18n.keyset<AppTranslationKey>('app');
}
