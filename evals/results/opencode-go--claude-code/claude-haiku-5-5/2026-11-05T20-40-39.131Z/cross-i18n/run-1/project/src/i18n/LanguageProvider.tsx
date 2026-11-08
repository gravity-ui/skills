import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { configure } from '@gravity-ui/uikit';

import { DEFAULT_LANGUAGE, LANGUAGES, translations } from './translations';
import type { Language, TranslationKey } from './translations';

const STORAGE_KEY = 'app-language';

type TranslateParams = Record<string, string | number>;

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

function readStoredLanguage(): Language | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isLanguage(stored) ? stored : null;
  } catch {
    // Storage can be unavailable (privacy mode, disabled cookies); fall back to the default.
    return null;
  }
}

function format(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => readStoredLanguage() ?? DEFAULT_LANGUAGE);

  const setLanguage = useCallback((next: Language) => setLanguageState(next), []);

  // Gravity UI components read their built-in strings (labels, aria texts, etc.) from this global config.
  // Layout effect so the switch is applied before the browser paints the new language.
  useLayoutEffect(() => {
    configure({ lang: language, fallbackLang: DEFAULT_LANGUAGE });
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translations[language]['app.documentTitle'];
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore: the choice will only last for the current page session.
    }
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, params?: TranslateParams) => format(translations[language][key], params),
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used inside <LanguageProvider>');
  }
  return context;
}
