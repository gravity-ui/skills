import * as React from 'react';
import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

import {AppKey, en, ru} from './keysets';

export const LANGUAGES = ['en', 'ru'] as const;
export type AppLanguage = (typeof LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<AppLanguage, string> = {
  en: 'English',
  ru: 'Русский',
};

// App strings. `keyset` reads the current language at call time, so `t` follows `setLang`.
const i18n = new I18N({
  lang: 'en',
  fallbackLang: 'en',
  data: {
    en: {app: en},
    ru: {app: ru},
  },
});
const t = i18n.keyset<AppKey>('app');

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  t: typeof t;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = React.useState<AppLanguage>('en');

  const setLang = React.useCallback((next: AppLanguage) => {
    i18n.setLang(next);
    // Gravity UI components read their language from uikit's global config (no ThemeProvider `lang` is set).
    configure({lang: next, fallbackLang: 'en'});
    document.documentElement.lang = next;
    setLangState(next);
  }, []);

  const value = React.useMemo(() => ({lang, setLang, t}), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return context;
}
