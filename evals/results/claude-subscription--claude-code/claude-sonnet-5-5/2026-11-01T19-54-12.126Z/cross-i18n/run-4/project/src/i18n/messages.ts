export type Language = 'en' | 'ru';

export const LANGUAGES: readonly Language[] = ['en', 'ru'];

const en = {
  'app.title': 'Welcome',
  'app.description': 'Choose the interface language using the switcher below.',
  'language.label': 'Interface language',
  'language.en': 'English',
  'language.ru': 'Русский',
  'app.current': 'Current language: {language}',
} as const;

export type MessageKey = keyof typeof en;

const ru: Record<MessageKey, string> = {
  'app.title': 'Добро пожаловать',
  'app.description': 'Выберите язык интерфейса с помощью переключателя ниже.',
  'language.label': 'Язык интерфейса',
  'language.en': 'English',
  'language.ru': 'Русский',
  'app.current': 'Текущий язык: {language}',
};

export const messages: Record<Language, Record<MessageKey, string>> = { en, ru };
