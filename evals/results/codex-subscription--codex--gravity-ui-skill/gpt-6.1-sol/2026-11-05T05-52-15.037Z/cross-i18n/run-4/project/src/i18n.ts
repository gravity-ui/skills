import {useSyncExternalStore} from 'react';
import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';
export const LANGUAGE_STORAGE_KEY = 'interface-language';

const en = {
  preferences: 'Preferences',
  title: 'Interface settings',
  description: 'Make the app feel right for you.',
  languageTitle: 'Language',
  languageDescription: 'Choose the language used throughout the interface.',
  languageLabel: 'Interface language',
  hint: 'Changes apply immediately. Your choice is remembered in this browser.',
  updated: 'Interface language updated.',
};

const ru: Record<keyof typeof en, string> = {
  preferences: 'Предпочтения',
  title: 'Настройки интерфейса',
  description: 'Настройте приложение под себя.',
  languageTitle: 'Язык',
  languageDescription: 'Выберите язык всех элементов интерфейса.',
  languageLabel: 'Язык интерфейса',
  hint: 'Изменения применяются сразу. Выбор сохраняется в этом браузере.',
  updated: 'Язык интерфейса изменён.',
};

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching remains available when browser storage is blocked.
  }

  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')
    ? 'ru'
    : 'en';
}

let language = getInitialLanguage();
const i18n = new I18N({lang: language, fallbackLang: 'en', data: {en: {app: en}, ru: {app: ru}}});
const listeners = new Set<() => void>();

export const t = i18n.keyset<keyof typeof en>('app');

function applyLanguage() {
  i18n.setLang(language);
  configure({lang: language});
  if (typeof document !== 'undefined') {
    document.documentElement.lang = language;
    document.title = t('title');
  }
}

applyLanguage();

export function getLanguage() {
  return language;
}

export function setLanguage(nextLanguage: Language) {
  if (!isLanguage(nextLanguage) || nextLanguage === language) return;
  language = nextLanguage;
  applyLanguage();
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Keep the current session usable even when the preference cannot be saved.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useLanguage() {
  const language = useSyncExternalStore(subscribe, getLanguage, getLanguage);
  return {language, t};
}
