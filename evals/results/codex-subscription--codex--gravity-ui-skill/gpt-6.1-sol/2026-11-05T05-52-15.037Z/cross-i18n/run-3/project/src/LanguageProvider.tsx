import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {configure, ThemeProvider} from '@gravity-ui/uikit';

import {createTranslator, getInitialLanguage, saveLanguage, type Language} from './i18n';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: ReturnType<typeof createTranslator>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const t = useMemo(() => createTranslator(language), [language]);
  const value = useMemo(() => ({language, setLanguage, t}), [language, t]);

  useEffect(() => {
    configure({lang: language});
    document.documentElement.lang = language;
    document.title = t('settings');
    saveLanguage(language);
  }, [language, t]);

  return (
    <LanguageContext.Provider value={value}>
      <ThemeProvider theme="light" lang={language}>
        {children}
      </ThemeProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
