import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { I18N } from '@gravity-ui/i18n';

export type AppLanguage = 'en' | 'ru';
export const appLanguages: AppLanguage[] = ['en', 'ru'];
export const defaultAppLanguage: AppLanguage = 'en';

export const appI18n = new I18N({ lang: defaultAppLanguage, fallbackLang: 'en' });

appI18n.registerKeysets('en', {
  app: {
    title: 'Gravity UI demo',
    description: 'Use the switcher to change the interface language.',
    language: 'Interface language',
    english: 'English',
    russian: 'Russian',
  },
});

appI18n.registerKeysets('ru', {
  app: {
    title: 'Демонстрация Gravity UI',
    description: 'Используйте переключатель, чтобы изменить язык интерфейса.',
    language: 'Язык интерфейса',
    english: 'Английский',
    russian: 'Русский',
  },
});

interface AppLanguageContextValue {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
}

const AppLanguageContext = createContext<AppLanguageContextValue>({
  language: defaultAppLanguage,
  setLanguage: () => {},
});

export function AppLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>(defaultAppLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const contextValue = useMemo(() => {
    appI18n.setLang(language);
    return { language, setLanguage };
  }, [language]);

  return <AppLanguageContext.Provider value={contextValue}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
  return useContext(AppLanguageContext);
}
