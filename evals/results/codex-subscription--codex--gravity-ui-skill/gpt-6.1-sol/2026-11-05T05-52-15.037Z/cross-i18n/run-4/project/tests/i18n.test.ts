import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {configure} = vi.hoisted(() => ({configure: vi.fn()}));
vi.mock('@gravity-ui/uikit', () => ({configure}));

describe('interface language', () => {
  let saved: Map<string, string>;

  beforeEach(() => {
    vi.resetModules();
    configure.mockClear();
    saved = new Map();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => saved.set(key, value),
    });
    vi.stubGlobal('navigator', {language: 'en-US'});
    vi.stubGlobal('document', {documentElement: {lang: ''}, title: ''});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each([
    ['ru-RU', 'ru'],
    ['en-GB', 'en'],
    ['fr-FR', 'en'],
  ])('uses a supported initial language for %s', async (browserLanguage, expected) => {
    vi.stubGlobal('navigator', {language: browserLanguage});
    const app = await import('../src/i18n');
    expect(app.getLanguage()).toBe(expected);
    expect(configure).toHaveBeenLastCalledWith({lang: expected});
    expect(document.documentElement.lang).toBe(expected);
  });

  it('restores the saved choice ahead of the browser language', async () => {
    saved.set('interface-language', 'en');
    vi.stubGlobal('navigator', {language: 'ru-RU'});
    const app = await import('../src/i18n');
    expect(app.getLanguage()).toBe('en');
    expect(app.t('title')).toBe('Interface settings');
  });

  it('ignores an unsupported saved language', async () => {
    saved.set('interface-language', 'de');
    vi.stubGlobal('navigator', {language: 'ru-RU'});
    const app = await import('../src/i18n');
    expect(app.getLanguage()).toBe('ru');
  });

  it('switches app strings, UIKit, document metadata and restores the choice on reload', async () => {
    const app = await import('../src/i18n');
    app.setLanguage('ru');
    expect(app.t('title')).toBe('Настройки интерфейса');
    expect(app.t('languageLabel')).toBe('Язык интерфейса');
    expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Настройки интерфейса');
    expect(saved.get(app.LANGUAGE_STORAGE_KEY)).toBe('ru');

    vi.resetModules();
    const reloaded = await import('../src/i18n');
    expect(reloaded.getLanguage()).toBe('ru');
    reloaded.setLanguage('en');
    expect(reloaded.t('languageLabel')).toBe('Interface language');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Interface settings');
    expect(configure).toHaveBeenLastCalledWith({lang: 'en'});
    expect(saved.get(reloaded.LANGUAGE_STORAGE_KEY)).toBe('en');
  });

  it('keeps switching available when browser storage is blocked', async () => {
    vi.stubGlobal('localStorage', {
      getItem() { throw new Error('Storage blocked'); },
      setItem() { throw new Error('Storage blocked'); },
    });
    const app = await import('../src/i18n');
    expect(app.getLanguage()).toBe('en');
    expect(() => app.setLanguage('ru')).not.toThrow();
    expect(app.t('title')).toBe('Настройки интерфейса');
    expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
  });
});
