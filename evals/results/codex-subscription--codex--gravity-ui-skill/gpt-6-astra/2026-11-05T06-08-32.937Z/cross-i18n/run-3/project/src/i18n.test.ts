import {afterEach, beforeEach, expect, it, vi} from 'vitest';
import {configure} from '@gravity-ui/uikit';

vi.mock('@gravity-ui/uikit', () => ({configure: vi.fn()}));

let storage: Map<string, string>;

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  storage = new Map();
  vi.stubGlobal('window', {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    },
  });
  vi.stubGlobal('document', {documentElement: {lang: ''}, title: ''});
});

afterEach(() => vi.unstubAllGlobals());

it('initializes in English when no preference is saved', async () => {
  const {initialLanguage, t} = await import('./i18n');
  expect(initialLanguage).toBe('en');
  expect(t('title')).toBe('Settings');
  expect(configure).toHaveBeenLastCalledWith({lang: 'en'});
  expect(document.documentElement.lang).toBe('en');
});

it('switches both directions and restores the saved language on reload', async () => {
  const {setLanguage, t} = await import('./i18n');
  setLanguage('ru');
  expect(t('title')).toBe('Настройки');
  expect(document.title).toBe('Настройки');
  expect(document.documentElement.lang).toBe('ru');
  expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});

  vi.resetModules();
  const reloaded = await import('./i18n');
  expect(reloaded.initialLanguage).toBe('ru');
  expect(reloaded.t('language')).toBe('Язык интерфейса');

  reloaded.setLanguage('en');
  expect(reloaded.t('title')).toBe('Settings');
  expect(document.title).toBe('Settings');
  expect(document.documentElement.lang).toBe('en');
  expect(configure).toHaveBeenLastCalledWith({lang: 'en'});
  expect(storage.get('app.language')).toBe('en');
});

it('falls back to English for an unsupported saved value', async () => {
  storage.set('app.language', 'fr');
  const {initialLanguage, isLanguage} = await import('./i18n');
  expect(initialLanguage).toBe('en');
  expect(isLanguage('fr')).toBe(false);
  expect(isLanguage(undefined)).toBe(false);
});

it('keeps switching functional when browser storage is blocked', async () => {
  vi.stubGlobal('window', {
    get localStorage() { throw new Error('Storage blocked'); },
  });
  const {initialLanguage, setLanguage, t} = await import('./i18n');
  expect(initialLanguage).toBe('en');
  expect(() => setLanguage('ru')).not.toThrow();
  expect(t('title')).toBe('Настройки');
  expect(configure).toHaveBeenLastCalledWith({lang: 'ru'});
});
