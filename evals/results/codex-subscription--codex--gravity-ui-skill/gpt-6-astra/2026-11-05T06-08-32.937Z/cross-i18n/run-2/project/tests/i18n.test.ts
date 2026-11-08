import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {configure} = vi.hoisted(() => ({configure: vi.fn()}));
vi.mock('@gravity-ui/uikit', () => ({configure}));

let storage: Map<string, string>;

beforeEach(() => {
  vi.resetModules();
  configure.mockClear();
  storage = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  vi.stubGlobal('document', {documentElement: {lang: ''}, title: ''});
});

afterEach(() => vi.unstubAllGlobals());

describe('interface language', () => {
  it('defaults to English and synchronizes the document and UIKit', async () => {
    const locale = await import('../src/i18n');
    expect(locale.getLanguage()).toBe('en');
    expect(locale.t('title')).toBe('Settings');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Settings');
    expect(configure).toHaveBeenLastCalledWith({lang: 'en'});
  });

  it('switches both ways, notifies subscribers, and restores the saved preference', async () => {
    let locale = await import('../src/i18n');
    const listener = vi.fn();
    const unsubscribe = locale.subscribeLanguage(listener);

    locale.setLanguage('ru');
    expect(locale.t('title')).toBe('Настройки');
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Настройки');
    expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
    expect(storage.get(locale.LANGUAGE_STORAGE_KEY)).toBe('ru');
    expect(listener).toHaveBeenCalledOnce();

    vi.resetModules();
    locale = await import('../src/i18n');
    expect(locale.getLanguage()).toBe('ru');
    expect(locale.t('title')).toBe('Настройки');
    locale.setLanguage('en');
    expect(locale.t('title')).toBe('Settings');
    expect(document.documentElement.lang).toBe('en');
    expect(configure).toHaveBeenLastCalledWith({lang: 'en'});
    expect(storage.get(locale.LANGUAGE_STORAGE_KEY)).toBe('en');
    unsubscribe();
  });

  it('ignores unsupported stored languages', async () => {
    storage.set('app-language', 'de');
    const locale = await import('../src/i18n');
    expect(locale.getLanguage()).toBe('en');
    expect(locale.isLanguage('de')).toBe(false);
    expect(locale.isLanguage(undefined)).toBe(false);
  });

  it('keeps switching available when storage is blocked', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw new Error('Storage blocked'); },
      setItem: () => { throw new Error('Storage blocked'); },
    });
    const locale = await import('../src/i18n');
    const listener = vi.fn();
    locale.subscribeLanguage(listener);
    expect(() => locale.setLanguage('ru')).not.toThrow();
    expect(locale.getLanguage()).toBe('ru');
    expect(locale.t('language')).toBe('Язык интерфейса');
    expect(listener).toHaveBeenCalledOnce();
  });
});
