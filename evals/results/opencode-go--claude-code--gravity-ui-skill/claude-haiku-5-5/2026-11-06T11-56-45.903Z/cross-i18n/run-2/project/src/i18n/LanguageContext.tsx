import * as React from 'react';

import { type AppLang, initialLang, setAppLang } from './i18n';

type LanguageContextValue = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
};

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<AppLang>(initialLang);

  const setLang = React.useCallback((next: AppLang) => {
    // Apply to the i18n instance and uikit first, so components rendered by
    // this state update already read the new language.
    setAppLang(next);
    setLangState(next);
  }, []);

  const value = React.useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const value = React.useContext(LanguageContext);
  if (!value) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return value;
}
