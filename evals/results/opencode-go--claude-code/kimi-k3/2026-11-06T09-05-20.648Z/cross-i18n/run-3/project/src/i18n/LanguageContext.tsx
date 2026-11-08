import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {configure} from '@gravity-ui/uikit';
import {formatMessage, translations} from './translations';
import type {Language, TranslationKey} from './translations';

const STORAGE_KEY = 'app.language';

function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

/** Priority: saved choice → browser language → English. */
function detectInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // localStorage may be unavailable (private mode, SSR) — fall through.
  }
  const browserLang = typeof navigator !== 'undefined' ? navigator.language : '';
  return browserLang.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  /** Translate a UI string, substituting `{placeholder}` params if given. */
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  // Side effects of a language change: <html lang>, Gravity UI's internal
  // strings (e.g. in its own components), and persistence of the choice.
  useEffect(() => {
    document.documentElement.lang = language;
    configure({lang: language});
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Non-fatal: the app still works, the choice just won't persist.
    }
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'ru' : 'en'));
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) =>
      formatMessage(language, key, params),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({language, setLanguage, toggleLanguage, t}),
    [language, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}

/** Convenience re-export so components can import everything from one place. */
export {translations};
export type {Language, TranslationKey};
