import {I18N} from '@gravity-ui/i18n';
import {Lang, configure} from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export type AppLang = 'en' | 'ru';

export const i18nInstance = new I18N({
  lang: 'en',
  fallbackLang: 'en',
  data: {en, ru},
});

// Keep uikit's own component texts (Pagination, Dialog, ...) in sync.
configure({lang: Lang.En, fallbackLang: Lang.En});

export const i18n = i18nInstance.keyset('app');

type Listener = () => void;

let lang: AppLang = 'en';
const listeners = new Set<Listener>();

export function getLang(): AppLang {
  return lang;
}

export function setLang(next: AppLang): void {
  if (next === lang) {
    return;
  }
  lang = next;
  i18nInstance.setLang(next);
  configure({lang: next === 'ru' ? Lang.Ru : Lang.En});
  listeners.forEach((listener) => listener());
}

export function subscribeLang(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
