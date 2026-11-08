import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'ru';

const translations = {
  en: {
    title: 'Cross i18n',
    description: 'Switch the interface language between English and Russian.',
    currentLanguage: 'Current language',
    switchLanguage: 'Switch language',
  },
  ru: {
    title: 'Cross i18n',
    description: 'Переключайте язык интерфейса между английским и русским.',
    currentLanguage: 'Текущий язык',
    switchLanguage: 'Переключить язык',
  },
} as const;

type TranslationKey = keyof (typeof translations)['en'];

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const languageStorageKey = 'app-language';

function getInitialLanguage(): Language {
  const storedLanguage = localStorage.getItem(languageStorageKey);

  return storedLanguage === 'en' || storedLanguage === 'ru' ? storedLanguage : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  const changeLanguage = useCallback((nextLanguage: Language) => {
    setLanguage(nextLanguage);
    localStorage.setItem(languageStorageKey, nextLanguage);
  }, []);

  const t = useCallback((key: TranslationKey) => translations[language][key], [language]);

  const value = useMemo(
    () => ({ language, setLanguage: changeLanguage, t }),
    [changeLanguage, language, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
