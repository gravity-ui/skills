import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';
import {useSyncExternalStore} from 'react';

export type Language = 'en' | 'ru';
const storageKey = 'app.language';

const en = {
  title: 'Settings',
  description: 'Make the application work for you.',
  language: 'Interface language',
  languageDescription: 'Choose a language. Changes apply immediately.',
  currentLanguage: 'The interface is displayed in English.',
};

const ru: Record<keyof typeof en, string> = {
  title: 'Настройки',
  description: 'Настройте приложение под себя.',
  language: 'Язык интерфейса',
  languageDescription: 'Выберите язык. Изменения применятся сразу.',
  currentLanguage: 'Интерфейс отображается на русском языке.',
};

const i18n = new I18N();
i18n.registerKeysets('en', {app: en});
i18n.registerKeysets('ru', {app: ru});

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    if (isLanguage(saved)) return saved;
  } catch {
    // Storage may be unavailable; language switching still works in memory.
  }

  return navigator.language.toLowerCase().split('-')[0] === 'ru' ? 'ru' : 'en';
}

let language = getInitialLanguage();
const listeners = new Set<() => void>();

function applyLanguage() {
  i18n.setLang(language);
  configure({lang: language});
  document.documentElement.lang = language;
  document.title = i18n.i18n('app', 'title');
}

// Initialize both dictionaries before the first React render.
applyLanguage();

function setLanguage(next: Language) {
  if (next === language) return;
  language = next;
  applyLanguage();
  try {
    localStorage.setItem(storageKey, next);
  } catch {
    // Do not block the interface when browser storage is restricted.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useLanguage() {
  const currentLanguage = useSyncExternalStore(subscribe, () => language);
  return {
    language: currentLanguage,
    setLanguage,
    t: (key: keyof typeof en) => i18n.i18n('app', key),
  };
}
