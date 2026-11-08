import React from 'react';
import { ThemeProvider, configure } from '@gravity-ui/uikit';

import {
  DEFAULT_LANGUAGE,
  isLanguage,
  translate,
  type Language,
  type TranslationKey,
  type TranslationParams,
} from './translations';

export const LANGUAGE_STORAGE_KEY = 'app.language';

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

function readStoredLanguage(): Language | undefined {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    return isLanguage(stored) ? stored : undefined;
  } catch {
    return undefined;
  }
}

function detectBrowserLanguage(): Language | undefined {
  if (typeof navigator === 'undefined') {
    return undefined;
  }
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const candidate of candidates) {
    const base = candidate?.toLowerCase().split('-')[0];
    if (isLanguage(base)) {
      return base;
    }
  }
  return undefined;
}

export function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }
  return readStoredLanguage() ?? detectBrowserLanguage() ?? DEFAULT_LANGUAGE;
}

export interface LanguageProviderProps {
  children: React.ReactNode;
  /** Overrides the stored / detected language (useful for tests and storybook). */
  initialLanguage?: Language;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [language, setLanguageState] = React.useState<Language>(
    () => initialLanguage ?? getInitialLanguage(),
  );

  // Expose the language to the document and keep Gravity UI's global config in
  // sync for anything rendered outside this provider. Components inside the
  // provider get the language through the nested <ThemeProvider lang> below:
  // that is context-based, so every built-in uikit string (Pagination, Select,
  // Dialog, ...) re-renders immediately when the language changes.
  React.useLayoutEffect(() => {
    configure({ lang: language, fallbackLang: DEFAULT_LANGUAGE });
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // Storage may be unavailable (private mode, quota); the switch still works in-memory.
    }
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => translate(language, key, params),
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      <ThemeProvider lang={language} fallbackLang={DEFAULT_LANGUAGE}>
        {children}
      </ThemeProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used inside <LanguageProvider>');
  }
  return context;
}

export function useTranslation() {
  const { t, language } = useLanguage();
  return { t, language };
}
