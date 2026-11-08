import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {configure} from '@gravity-ui/uikit';
import {
  applyLanguage,
  getInitialLanguage,
  getTranslator,
  LANGUAGE_STORAGE_KEY,
} from './i18n';

vi.mock('@gravity-ui/uikit', () => ({configure: vi.fn()}));

describe('interface language', () => {
  let storage: Map<string, string>;

  beforeEach(() => {
    storage = new Map();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
    vi.stubGlobal('document', {documentElement: {lang: ''}, title: ''});
    vi.clearAllMocks();
  });

  afterEach(() => vi.unstubAllGlobals());

  it('defaults to English when there is no saved preference', () => {
    expect(getInitialLanguage()).toBe('en');
  });

  it('ignores an unsupported saved language', () => {
    storage.set(LANGUAGE_STORAGE_KEY, 'fr');
    expect(getInitialLanguage()).toBe('en');
  });

  it.each(['en', 'ru'] as const)('restores the saved %s language', (language) => {
    storage.set(LANGUAGE_STORAGE_KEY, language);
    expect(getInitialLanguage()).toBe(language);
  });

  it('can switch to Russian and back, updating UIKit, page metadata and storage', () => {
    applyLanguage('ru');
    expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Настройки интерфейса');
    expect(getInitialLanguage()).toBe('ru');
    expect(getTranslator('ru')('interfaceLanguage')).toBe('Язык интерфейса');

    applyLanguage('en');
    expect(configure).toHaveBeenLastCalledWith({lang: 'en'});
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Interface settings');
    expect(getInitialLanguage()).toBe('en');
    expect(getTranslator('en')('interfaceLanguage')).toBe('Interface language');
  });

  it('falls back safely when access to browser storage is blocked', () => {
    vi.stubGlobal('window', {
      get localStorage() { throw new Error('Storage blocked'); },
    });
    expect(getInitialLanguage()).toBe('en');
    expect(() => applyLanguage('ru')).not.toThrow();
    expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Настройки интерфейса');
  });

  it('still changes language if writing to storage fails', () => {
    vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    expect(() => applyLanguage('ru')).not.toThrow();
    expect(document.documentElement.lang).toBe('ru');
    expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
  });
});
