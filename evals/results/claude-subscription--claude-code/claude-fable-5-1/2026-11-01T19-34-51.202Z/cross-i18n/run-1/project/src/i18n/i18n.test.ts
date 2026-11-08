import {describe, expect, it} from 'vitest';

import {en} from './en';
import {DEFAULT_LANG, LANG_STORAGE_KEY, detectInitialLang, isLang, translate} from './index';
import {ru} from './ru';

describe('dictionaries', () => {
  it('ru covers every key from en', () => {
    expect(Object.keys(ru).sort()).toEqual(Object.keys(en).sort());
  });

  it('has no empty translations', () => {
    for (const dict of [en, ru]) {
      for (const [key, value] of Object.entries(dict)) {
        expect(value.trim(), key).not.toBe('');
      }
    }
  });
});

describe('translate', () => {
  it('returns strings for the requested language', () => {
    expect(translate('en', 'form.submit')).toBe('Save');
    expect(translate('ru', 'form.submit')).toBe('Сохранить');
  });

  it('substitutes placeholders', () => {
    expect(translate('en', 'greeting.title', {name: 'Ann'})).toBe('Hello, Ann!');
    expect(translate('ru', 'greeting.title', {name: 'Аня'})).toBe('Привет, Аня!');
  });

  it('keeps unknown placeholders untouched', () => {
    expect(translate('en', 'greeting.title', {})).toBe('Hello, {name}!');
  });
});

describe('detectInitialLang', () => {
  const storageWith = (value: string | null) => ({getItem: () => value});

  it('prefers the saved language', () => {
    expect(detectInitialLang(storageWith('ru'), ['en-US'])).toBe('ru');
  });

  it('ignores invalid saved values and falls back to navigator languages', () => {
    expect(detectInitialLang(storageWith('xx'), ['de-DE', 'ru-RU'])).toBe('ru');
    expect(detectInitialLang(storageWith(null), ['en-GB'])).toBe('en');
  });

  it('falls back to the default language', () => {
    expect(detectInitialLang(storageWith(null), ['de-DE'])).toBe(DEFAULT_LANG);
  });

  it('survives a throwing storage', () => {
    const broken = {
      getItem: () => {
        throw new Error('blocked');
      },
    };
    expect(detectInitialLang(broken, ['ru'])).toBe('ru');
  });

  it('exposes helpers', () => {
    expect(isLang('en')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(LANG_STORAGE_KEY).toBe('app.lang');
  });
});
