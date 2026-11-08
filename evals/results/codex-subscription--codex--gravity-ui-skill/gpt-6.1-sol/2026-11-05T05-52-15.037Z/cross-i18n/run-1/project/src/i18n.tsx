import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';
import {createContext, useContext, useLayoutEffect, useMemo, useState, type ReactNode} from 'react';

import en from './locales/en.json';
import ru from './locales/ru.json';

export type Language = 'en' | 'ru';
type TranslationKey = keyof typeof en;
const translations: Record<Language, Record<TranslationKey, string>> = {en, ru};
const storageKey = 'interface-language';

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(storageKey);
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching also works when browser storage is unavailable.
  }

  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function createTranslator(language: Language) {
  const instance = new I18N({lang: language, fallbackLang: 'en'});
  for (const locale of ['en', 'ru'] as const) {
    instance.registerKeysets(locale, {app: translations[locale]});
  }
  return instance.keyset<TranslationKey>('app');
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: ReturnType<typeof createTranslator>;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, updateLanguage] = useState<Language>(getInitialLanguage);
  const t = useMemo(() => createTranslator(language), [language]);

  useLayoutEffect(() => {
    configure({lang: language});
    document.documentElement.lang = language;
    document.title = t('title');
  }, [language, t]);

  function setLanguage(nextLanguage: Language) {
    updateLanguage(nextLanguage);
    try {
      localStorage.setItem(storageKey, nextLanguage);
    } catch {
      // Keep the selected language for this session if storage is blocked.
    }
  }

  return (
    <LanguageContext.Provider value={{language, setLanguage, t}}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
