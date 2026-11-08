import {I18N} from '@gravity-ui/i18n';

export type Language = 'en' | 'ru';

export const LANGUAGE_STORAGE_KEY = 'interface-language';

const en = {
  settings: 'Settings',
  settingsDescription: 'Make the app feel right for you.',
  language: 'Interface language',
  languageDescription: 'Choose the language used throughout the app.',
  preferenceNote: 'Changes apply immediately. Your choice is saved in this browser when storage is available.',
  currentLanguage: 'Current interface language: English',
};

const ru: Record<keyof typeof en, string> = {
  settings: 'Настройки',
  settingsDescription: 'Настройте приложение под себя.',
  language: 'Язык интерфейса',
  languageDescription: 'Выберите язык, который будет использоваться в приложении.',
  preferenceNote: 'Изменения применяются сразу. Ваш выбор сохраняется в этом браузере, если хранилище доступно.',
  currentLanguage: 'Текущий язык интерфейса: русский',
};

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching still works when browser storage is unavailable.
  }

  const browserLanguages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const locale of browserLanguages) {
    const language = locale.toLowerCase().split('-')[0];
    if (isLanguage(language)) return language;
  }

  return 'en';
}

export function saveLanguage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Keep the preference in React state for the current session.
  }
}

export function createTranslator(language: Language) {
  const i18n = new I18N({lang: language, fallbackLang: 'en'});
  i18n.registerKeysets('en', {app: en});
  i18n.registerKeysets('ru', {app: ru});
  return i18n.keyset<keyof typeof en>('app');
}
