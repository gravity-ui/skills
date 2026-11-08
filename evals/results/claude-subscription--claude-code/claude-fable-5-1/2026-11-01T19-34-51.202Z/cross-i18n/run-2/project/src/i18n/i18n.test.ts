import { describe, expect, it } from 'vitest';

import { dictionaries, translate } from './dictionaries';
import { SUPPORTED_LANGS } from './types';
import { en } from './en';

describe('i18n dictionaries', () => {
  const baseKeys = Object.keys(en).sort();

  it.each(SUPPORTED_LANGS)('"%s" dictionary has exactly the same keys as "en"', (lang) => {
    expect(Object.keys(dictionaries[lang]).sort()).toEqual(baseKeys);
  });

  it.each(SUPPORTED_LANGS)('"%s" dictionary has no empty strings', (lang) => {
    for (const [key, value] of Object.entries(dictionaries[lang])) {
      expect(value.trim(), `${lang}.${key}`).not.toBe('');
    }
  });

  it('translates and interpolates params', () => {
    expect(translate('en', 'lang.current', { lang: 'English' })).toBe('Current language: English');
    expect(translate('ru', 'lang.current', { lang: 'Русский' })).toBe('Текущий язык: Русский');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(translate('en', 'lang.current')).toBe('Current language: {lang}');
  });
});
