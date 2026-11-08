export const LANGUAGES = ['en', 'ru'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

const en = {
  'app.documentTitle': 'Gravity UI eval',
  'app.title': 'Language switcher',
  'app.description':
    'Switch the interface language between English and Russian. Your choice is remembered in this browser.',
  'language.label': 'Interface language',
  'counter.title': 'Counter',
  'counter.value': 'Current value: {count}',
  'counter.increment': 'Increment',
  'counter.decrement': 'Decrement',
  'counter.reset': 'Reset',
};

export type TranslationKey = keyof typeof en;

const ru: Record<TranslationKey, string> = {
  'app.documentTitle': 'Gravity UI: проверка',
  'app.title': 'Переключение языка',
  'app.description':
    'Переключайте язык интерфейса между английским и русским. Ваш выбор сохраняется в этом браузере.',
  'language.label': 'Язык интерфейса',
  'counter.title': 'Счётчик',
  'counter.value': 'Текущее значение: {count}',
  'counter.increment': 'Увеличить',
  'counter.decrement': 'Уменьшить',
  'counter.reset': 'Сбросить',
};

export const translations: Record<Language, Record<TranslationKey, string>> = { en, ru };

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};
