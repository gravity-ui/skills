import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type Language = 'en' | 'ru';

const translations = {
  en: {
    languageSwitcher: 'Interface language',
    greeting: 'Hello!',
    description: 'Switch the interface language using the control above.',
    currentLanguage: 'English',
  },
  ru: {
    languageSwitcher: 'Язык интерфейса',
    greeting: 'Привет!',
    description: 'Переключайте язык интерфейса с помощью элемента выше.',
    currentLanguage: 'Русский',
  },
} as const satisfies Record<Language, Record<string, string>>;

type TranslationKey = keyof (typeof translations)['en'];

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (key: TranslationKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      translate: (key) => translations[language][key],
    }),
    [language],
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
