export type Language = 'en' | 'ru';

export const LANGUAGE_STORAGE_KEY = 'interface-language';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(savedLanguage)) return savedLanguage;
  } catch {
    // Fall back to browser preferences if storage is blocked.
  }

  if (typeof navigator !== 'undefined') {
    for (const locale of navigator.languages ?? [navigator.language]) {
      const language = locale.toLowerCase().split('-')[0];
      if (isLanguage(language)) return language;
    }
  }

  return 'en';
}

const en = {
  pageTitle: 'Language settings · Workspace',
  appName: 'Workspace',
  preferences: 'YOUR PREFERENCES',
  settings: 'Settings',
  settingsDescription: 'A little more personal. Make your workspace feel like home.',
  languageTitle: 'Interface language',
  languageDescription: 'Choose the language that feels right for you.',
  languageLabel: 'Language',
  languageHelp: 'Menus, labels, and messages will use this language.',
  autoSaved: 'Your preference is saved automatically.',
  sessionOnly: 'Language changed. Your browser could not save this preference.',
  preview: 'A LOOK AT YOUR INTERFACE',
  welcome: 'Welcome to your workspace',
  welcomeDescription: 'Everything you need, in a language you know.',
  home: 'Home',
  projects: 'Projects',
  deviceNote: 'This preference applies to this browser. You can change it anytime.',
};

export const translations: Record<Language, Record<keyof typeof en, string>> = {
  en,
  ru: {
    pageTitle: 'Настройки языка · Рабочее пространство',
    appName: 'Рабочее пространство',
    preferences: 'ВАШИ ПРЕДПОЧТЕНИЯ',
    settings: 'Настройки',
    settingsDescription: 'Добавьте индивидуальности. Настройте рабочее пространство под себя.',
    languageTitle: 'Язык интерфейса',
    languageDescription: 'Выберите язык, на котором вам удобнее работать.',
    languageLabel: 'Язык',
    languageHelp: 'Меню, подписи и сообщения будут отображаться на выбранном языке.',
    autoSaved: 'Ваш выбор сохраняется автоматически.',
    sessionOnly: 'Язык изменён. Браузеру не удалось сохранить ваш выбор.',
    preview: 'ТАК БУДЕТ ВЫГЛЯДЕТЬ ИНТЕРФЕЙС',
    welcome: 'Добро пожаловать в рабочее пространство',
    welcomeDescription: 'Всё необходимое — на понятном вам языке.',
    home: 'Главная',
    projects: 'Проекты',
    deviceNote: 'Настройка действует в этом браузере. Вы можете изменить её в любой момент.',
  },
};
