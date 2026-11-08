import * as React from 'react';
import { configure } from '@gravity-ui/uikit';

import { type AppKey, type Lang, i18n } from './index';

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: AppKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>('en');

  // Update the app-string instance and the uikit config synchronously, before React
  // re-renders. uikit's `configure` mutates a shared object, so components reading
  // `useLang()` pick up the new language on the same render.
  const setLang = React.useCallback((next: Lang) => {
    i18n.setLang(next);
    configure({ lang: next, fallbackLang: 'en' });
    setLangState(next);
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, params) => i18n.i18n('app', key, params),
    }),
    [lang, setLang],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }
  return context;
}
