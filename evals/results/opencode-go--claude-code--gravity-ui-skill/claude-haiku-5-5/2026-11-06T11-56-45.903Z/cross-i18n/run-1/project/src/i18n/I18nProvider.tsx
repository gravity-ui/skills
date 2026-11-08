import * as React from 'react';
import { I18N } from '@gravity-ui/i18n';
import { configure } from '@gravity-ui/uikit';

import { en, ru, type AppKey } from './keysets';

export type Lang = 'en' | 'ru';

// One i18n instance for app strings. Gravity UI's own strings (e.g. inside Select,
// Pagination) are switched separately via uikit's `configure({lang})`.
const i18n = new I18N({
  lang: 'en',
  fallbackLang: 'en',
  data: {
    en: { app: en },
    ru: { app: ru },
  },
});

const translate = i18n.keyset<AppKey>('app');

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: AppKey) => string;
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>('en');

  // Update all translation sources before React re-renders consumers, so that
  // `t` already returns strings for the new language during that render.
  const setLang = React.useCallback((next: Lang) => {
    i18n.setLang(next);
    configure({ lang: next });
    document.documentElement.lang = next;
    setLangState(next);
  }, []);

  const value = React.useMemo<I18nContextValue>(() => ({ lang, setLang, t: translate }), [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
