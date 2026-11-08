import { describe, expect, it } from 'vitest';

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  isLanguage,
  translate,
  translations,
  type TranslationKey,
} from './translations';

describe('translations', () => {
  it('every language has every key of the default dictionary', () => {
    const keys = Object.keys(translations[DEFAULT_LANGUAGE]) as TranslationKey[];
    for (const lang of LANGUAGES) {
      for (const key of keys) {
        expect(translations[lang][key], `${lang}:${key}`).toBeTruthy();
      }
    }
  });

  it('translates into English and Russian', () => {
    expect(translate('en', 'app.title')).toBe('Language switcher demo');
    expect(translate('ru', 'app.title')).toBe('Демонстрация переключения языка');
  });

  it('substitutes parameters and keeps unknown placeholders', () => {
    expect(translate('en', 'language.current', { language: 'English' })).toBe(
      'Current language: English',
    );
    expect(translate('ru', 'language.current', { language: 'Русский' })).toBe(
      'Текущий язык: Русский',
    );
    expect(translate('en', 'language.current')).toBe('Current language: {language}');
  });

  it('falls back to the default language and then to the key', () => {
    const anyTranslate = translate as unknown as (lang: string, key: string) => string;
    expect(anyTranslate('de', 'app.title')).toBe('Language switcher demo');
    expect(anyTranslate('en', 'missing.key')).toBe('missing.key');
  });

  it('validates language codes', () => {
    expect(isLanguage('en')).toBe(true);
    expect(isLanguage('ru')).toBe(true);
    expect(isLanguage('de')).toBe(false);
    expect(isLanguage(null)).toBe(false);
  });
});
