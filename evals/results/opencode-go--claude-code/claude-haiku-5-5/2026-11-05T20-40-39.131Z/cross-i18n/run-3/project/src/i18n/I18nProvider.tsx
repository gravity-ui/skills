import * as React from 'react';

import { LANGUAGES, translations, type Language, type TranslationKey } from './translations';

const STORAGE_KEY = 'app.language';

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/** Saved choice wins; otherwise pick Russian for Russian-speaking browsers, English for the rest. */
function readInitialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) {
      return stored;
    }
  } catch {
    // Storage may be unavailable (e.g. privacy mode); fall through to browser detection.
  }
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = React.useState<Language>(readInitialLanguage);

  React.useEffect(() => {
    document.documentElement.lang = language;
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Persisting the choice is best-effort only.
    }
  }, [language]);

  const value = React.useMemo<I18nContextValue>(() => {
    const dictionary = translations[language];
    return {
      language,
      setLanguage,
      t: (key) => dictionary[key],
    };
  }, [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
