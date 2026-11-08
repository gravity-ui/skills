export const LANGS = ['en', 'ru'] as const;

export type Lang = (typeof LANGS)[number];

/** Language names are shown in their own language, so they are not translated. */
export const LANGUAGE_NAMES: Record<Lang, string> = {
  en: 'English',
  ru: 'Русский',
};

const en = {
  language: 'Language',
  welcomeTitle: 'Welcome',
  welcomeText: 'Use the switcher to change the interface language. Your choice is saved in this browser.',
  cardTitle: 'Getting started',
  cardText: 'This interface is available in English and Russian.',
};

export type MessageKey = keyof typeof en;

// Typed as Record<MessageKey, string> so that a missing Russian key is a compile error.
const ru: Record<MessageKey, string> = {
  language: 'Язык',
  welcomeTitle: 'Добро пожаловать',
  welcomeText: 'Переключатель меняет язык интерфейса. Выбор сохраняется в этом браузере.',
  cardTitle: 'Начало работы',
  cardText: 'Интерфейс доступен на английском и русском языках.',
};

export const messages: Record<Lang, Record<MessageKey, string>> = { en, ru };
