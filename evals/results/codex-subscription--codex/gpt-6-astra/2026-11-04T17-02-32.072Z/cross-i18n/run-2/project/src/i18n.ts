export type Language = 'en' | 'ru';

export const languageStorageKey = 'interface-language';

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(languageStorageKey);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // Use the browser language if storage is blocked.
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')
    ? 'ru'
    : 'en';
}

const en = {
  pageTitle: 'Language settings',
  preferences: 'PREFERENCES',
  title: 'Make yourself at home',
  description: 'Choose the language that feels right for you.',
  interfaceLanguage: 'Interface language',
  languageHint: 'Choose the language used throughout the app.',
  immediateChanges: 'Changes apply immediately.',
  preview: 'PREVIEW',
  welcome: 'Hello, welcome back!',
  previewDescription: 'Your interface is now in English. You can change your language at any time.',
  currentLanguage: 'Current language',
  languageName: 'English',
  footer: 'A little setting. A more familiar experience.',
};

export const messages: Record<Language, Record<keyof typeof en, string>> = {
  en,
  ru: {
    pageTitle: 'Настройки языка',
    preferences: 'НАСТРОЙКИ',
    title: 'Чувствуйте себя как дома',
    description: 'Выберите язык, на котором вам удобно работать.',
    interfaceLanguage: 'Язык интерфейса',
    languageHint: 'Выберите язык для всего приложения.',
    immediateChanges: 'Изменения применяются сразу.',
    preview: 'ПРЕДПРОСМОТР',
    welcome: 'Здравствуйте, с возвращением!',
    previewDescription: 'Теперь интерфейс на русском языке. Вы можете изменить язык в любой момент.',
    currentLanguage: 'Текущий язык',
    languageName: 'Русский',
    footer: 'Небольшая настройка — больше комфорта.',
  },
};
