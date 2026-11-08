export type Language = 'en' | 'ru';

export const LANGUAGE_STORAGE_KEY = 'interface-language';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // Use the default when storage is blocked by browser settings.
  }
  return 'en';
}

const en = {
  pageTitle: 'Language settings',
  preferences: 'PREFERENCES',
  heading: 'Settings',
  description: 'Make the interface feel like home.',
  languageHeading: 'Language',
  languageDescription: 'Choose the language you prefer to use.',
  languageLabel: 'Interface language',
  hint: 'The interface updates immediately. No reload needed.',
  saved: 'Your language preference is saved automatically.',
  sessionOnly: 'Language changed. Your browser could not save this preference.',
  footer: 'You can change your language at any time.',
};

export const messages: Record<Language, Record<keyof typeof en, string>> = {
  en,
  ru: {
    pageTitle: 'Настройки языка',
    preferences: 'ПАРАМЕТРЫ',
    heading: 'Настройки',
    description: 'Настройте интерфейс под себя.',
    languageHeading: 'Язык',
    languageDescription: 'Выберите удобный для вас язык.',
    languageLabel: 'Язык интерфейса',
    hint: 'Интерфейс изменится сразу. Перезагрузка не нужна.',
    saved: 'Выбранный язык сохраняется автоматически.',
    sessionOnly: 'Язык изменён. Браузеру не удалось сохранить выбор.',
    footer: 'Вы можете изменить язык в любой момент.',
  },
};
