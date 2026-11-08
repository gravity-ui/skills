export type Language = 'en' | 'ru';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem('app-language');
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching remains available when browser storage is disabled.
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export const messages = {
  en: {
    pageTitle: 'Language settings · Workspace',
    appName: 'Workspace',
    preferences: 'MAKE IT YOURS',
    settings: 'Settings',
    description: 'A familiar space starts with a language that feels like home.',
    language: 'Language',
    languageDescription: 'Choose the language you’d like to use across the app.',
    interfaceLanguage: 'Interface language',
    english: 'English',
    russian: 'Russian',
    selected: 'Selected',
    selectLanguage: 'Select language',
    savedNote: 'Changes apply instantly and are saved on this device.',
    sessionNote: 'Changes apply instantly. Your browser cannot save this preference.',
    preview: 'A LITTLE PREVIEW',
    welcome: 'Hello, and welcome!',
    welcomeDescription: 'Everything feels a little easier in your language.',
    currentLanguage: 'English interface',
    footer: 'Two languages. One familiar workspace.',
  },
  ru: {
    pageTitle: 'Настройки языка · Рабочее пространство',
    appName: 'Рабочее пространство',
    preferences: 'НАСТРОЙТЕ ПОД СЕБЯ',
    settings: 'Настройки',
    description: 'Знакомое пространство начинается с языка, на котором вам удобно.',
    language: 'Язык',
    languageDescription: 'Выберите язык интерфейса приложения.',
    interfaceLanguage: 'Язык интерфейса',
    english: 'Английский',
    russian: 'Русский',
    selected: 'Выбран',
    selectLanguage: 'Выбрать язык',
    savedNote: 'Изменения применяются сразу и сохраняются на этом устройстве.',
    sessionNote: 'Изменения применяются сразу. Браузер не позволяет сохранить выбор.',
    preview: 'ПРЕДВАРИТЕЛЬНЫЙ ПРОСМОТР',
    welcome: 'Привет! Рады вас видеть.',
    welcomeDescription: 'На родном языке всё становится немного проще.',
    currentLanguage: 'Интерфейс на русском',
    footer: 'Два языка. Одно привычное рабочее пространство.',
  },
} satisfies Record<Language, Record<string, string>>;
