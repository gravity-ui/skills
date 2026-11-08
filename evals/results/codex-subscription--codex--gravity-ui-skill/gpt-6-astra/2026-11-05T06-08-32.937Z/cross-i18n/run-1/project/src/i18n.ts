import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';
import {useSyncExternalStore} from 'react';

import en from './locales/en.json';
import ru from './locales/ru.json';

export type Language = 'en' | 'ru';
const storageKey = 'app-language';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching also works when browser storage is unavailable.
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

const i18n = new I18N();
i18n.registerKeysets('en', {app: en});
i18n.registerKeysets('ru', {app: ru satisfies Record<keyof typeof en, string>});

export const t = i18n.keyset<keyof typeof en>('app');
let language = getInitialLanguage();
const listeners = new Set<() => void>();

function applyLanguage() {
  i18n.setLang(language);
  configure({lang: language});
  document.documentElement.lang = language;
  document.title = t('title');
}

// Set both translation systems before the first React render.
applyLanguage();

export function setLanguage(nextLanguage: Language) {
  if (!isLanguage(nextLanguage) || nextLanguage === language) return;
  language = nextLanguage;
  applyLanguage();
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // Keep the current session usable even if saving the preference fails.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function useLanguage() {
  return useSyncExternalStore(subscribe, () => language);
}
