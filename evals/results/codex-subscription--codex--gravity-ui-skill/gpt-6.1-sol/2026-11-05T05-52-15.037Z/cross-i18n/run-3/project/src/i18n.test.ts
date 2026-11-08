import {afterEach, describe, expect, it, vi} from 'vitest';

import {createTranslator, getInitialLanguage, LANGUAGE_STORAGE_KEY, saveLanguage} from './i18n';

afterEach(() => vi.unstubAllGlobals());

function mockBrowser(languages: string[], saved: string | null = null) {
  const storage = {
    getItem: vi.fn(() => saved),
    setItem: vi.fn(),
  };
  vi.stubGlobal('navigator', {languages, language: languages[0] ?? 'en'});
  vi.stubGlobal('localStorage', storage);
  return storage;
}

describe('language preferences', () => {
  it('restores the saved choice ahead of the browser language', () => {
    const storage = mockBrowser(['en-US'], 'ru');
    expect(getInitialLanguage()).toBe('ru');
    expect(storage.getItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY);
  });

  it('uses the first supported browser language, including regional variants', () => {
    mockBrowser(['de-DE', 'ru-RU', 'en-US']);
    expect(getInitialLanguage()).toBe('ru');
  });

  it('ignores an invalid saved preference', () => {
    mockBrowser(['en-GB'], 'fr');
    expect(getInitialLanguage()).toBe('en');
  });

  it('falls back to English for unsupported browser languages', () => {
    mockBrowser(['fr-FR', 'de-DE']);
    expect(getInitialLanguage()).toBe('en');
  });

  it('supports browsers that expose only navigator.language', () => {
    mockBrowser([]);
    vi.stubGlobal('navigator', {language: 'ru-RU'});
    expect(getInitialLanguage()).toBe('ru');
  });

  it('keeps working when reading or writing storage is blocked', () => {
    const storage = mockBrowser(['ru-RU']);
    storage.getItem.mockImplementation(() => {throw new Error('Storage blocked');});
    storage.setItem.mockImplementation(() => {throw new Error('Storage blocked');});
    expect(getInitialLanguage()).toBe('ru');
    expect(() => saveLanguage('en')).not.toThrow();
  });

  it('saves a choice so it can be restored after a reload', () => {
    const storage = mockBrowser(['en-US']);
    saveLanguage('ru');
    expect(storage.setItem).toHaveBeenCalledWith(LANGUAGE_STORAGE_KEY, 'ru');
    storage.getItem.mockReturnValue(storage.setItem.mock.calls[0][1]);
    expect(getInitialLanguage()).toBe('ru');
  });
});

describe('translations', () => {
  it('keeps English and Russian translations independent', () => {
    const en = createTranslator('en');
    const ru = createTranslator('ru');
    expect(en('settings')).toBe('Settings');
    expect(ru('settings')).toBe('Настройки');
    expect(en('language')).toBe('Interface language');
    expect(ru('language')).toBe('Язык интерфейса');
  });
});
