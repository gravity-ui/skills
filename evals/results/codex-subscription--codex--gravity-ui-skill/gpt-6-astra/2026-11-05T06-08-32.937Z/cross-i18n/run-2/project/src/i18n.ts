import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';
export const LANGUAGE_STORAGE_KEY = 'app-language';

const en = {
  title: 'Settings',
  description: 'Make the application feel right for you.',
  language: 'Interface language',
  languageDescription: 'Choose a language. Changes apply immediately.',
  currentLanguage: 'The interface is displayed in English.',
};
const ru: Record<keyof typeof en, string> = {
  title: 'Настройки',
  description: 'Настройте приложение для удобной работы.',
  language: 'Язык интерфейса',
  languageDescription: 'Выберите язык. Изменения применяются сразу.',
  currentLanguage: 'Интерфейс отображается на русском языке.',
};

const i18n = new I18N();
i18n.registerKeysets('en', {app: en});
i18n.registerKeysets('ru', {app: ru});

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

function readLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching remains available when browser storage is blocked.
  }
  return 'en';
}

let language = readLanguage();
const listeners = new Set<() => void>();

function applyLanguage() {
  i18n.setLang(language);
  configure({lang: language});
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    document.title = t('title');
  }
}

export function t(key: keyof typeof en): string {
  return i18n.i18n('app', key);
}

export const getLanguage = () => language;

export function subscribeLanguage(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function setLanguage(nextLanguage: Language) {
  if (!isLanguage(nextLanguage) || nextLanguage === language) return;
  language = nextLanguage;
  applyLanguage();
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Keep the current session usable even if the preference cannot be saved.
  }
  listeners.forEach((listener) => listener());
}

applyLanguage();
