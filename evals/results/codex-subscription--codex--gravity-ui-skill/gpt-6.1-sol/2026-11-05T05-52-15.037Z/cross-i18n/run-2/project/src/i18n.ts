import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';
export const LANGUAGE_STORAGE_KEY = 'interface-language';

const en = {
  settings: 'Settings',
  title: 'Interface settings',
  description: 'Make the application feel more familiar.',
  language: 'Language',
  languageDescription: 'Choose the language used throughout the application.',
  interfaceLanguage: 'Interface language',
  hint: 'Changes apply immediately. No reload needed.',
  currentLanguage: 'Current language: English',
};

const ru: Record<keyof typeof en, string> = {
  settings: 'Настройки',
  title: 'Настройки интерфейса',
  description: 'Настройте приложение так, как вам удобно.',
  language: 'Язык',
  languageDescription: 'Выберите язык, на котором будет отображаться приложение.',
  interfaceLanguage: 'Язык интерфейса',
  hint: 'Изменения применяются сразу. Перезагрузка не нужна.',
  currentLanguage: 'Текущий язык: русский',
};

// Each translator keeps its language, so rendering never mutates shared state.
const translators = Object.fromEntries(
  (['en', 'ru'] as const).map((lang) => {
    const instance = new I18N({lang, fallbackLang: 'en'});
    instance.registerKeysets('en', {app: en});
    instance.registerKeysets('ru', {app: ru});
    return [lang, instance.keyset<keyof typeof en>('app')];
  }),
) as Record<Language, (key: keyof typeof en) => string>;

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // The interface still works when browser storage is unavailable.
  }
  return 'en';
}

export function getTranslator(language: Language) {
  return translators[language];
}

export function applyLanguage(language: Language) {
  configure({lang: language});
  document.documentElement.lang = language;
  document.title = getTranslator(language)('title');

  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Persistence is optional; switching the current interface is not.
  }
}
