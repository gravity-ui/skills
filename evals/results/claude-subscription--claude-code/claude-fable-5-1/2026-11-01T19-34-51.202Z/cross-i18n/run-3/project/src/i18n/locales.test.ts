import { describe, expect, it } from 'vitest';

import { LANGS, formatMessage, messages, resolveInitialLang, translate } from './locales';

describe('locale dictionaries', () => {
  it('have the same set of keys in every language', () => {
    const enKeys = Object.keys(messages.en).sort();
    for (const lang of LANGS) {
      expect(Object.keys(messages[lang]).sort(), `keys of "${lang}"`).toEqual(enKeys);
    }
  });

  it('have no empty translations', () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(messages[lang])) {
        expect(value.trim(), `${lang}.${key}`).not.toBe('');
      }
    }
  });

  it('use the same placeholders in every language', () => {
    const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();
    for (const key of Object.keys(messages.en) as (keyof typeof messages.en)[]) {
      for (const lang of LANGS) {
        expect(placeholders(messages[lang][key]), `${lang}.${key}`).toEqual(
          placeholders(messages.en[key]),
        );
      }
    }
  });
});

describe('resolveInitialLang', () => {
  it('prefers the stored choice', () => {
    expect(resolveInitialLang('ru', ['en-US'])).toBe('ru');
  });

  it('ignores an invalid stored value and falls back to browser languages', () => {
    expect(resolveInitialLang('xx', ['de-DE', 'ru-RU', 'en'])).toBe('ru');
    expect(resolveInitialLang(null, ['en-GB'])).toBe('en');
  });

  it('falls back to the default language', () => {
    expect(resolveInitialLang(null, ['de', 'fr'])).toBe('en');
    expect(resolveInitialLang(undefined)).toBe('en');
  });
});

describe('translate', () => {
  it('returns strings for the requested language', () => {
    expect(translate('en', 'counter.increment')).toBe('Click me');
    expect(translate('ru', 'counter.increment')).toBe('Нажми меня');
  });

  it('interpolates parameters', () => {
    expect(translate('ru', 'counter.label', { count: 3 })).toBe('Кнопка нажата 3 раз');
    expect(formatMessage('{a} and {missing}', { a: 1 })).toBe('1 and {missing}');
  });
});
