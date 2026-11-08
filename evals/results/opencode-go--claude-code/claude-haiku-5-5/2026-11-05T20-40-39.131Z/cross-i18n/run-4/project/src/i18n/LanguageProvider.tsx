import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { configure } from '@gravity-ui/uikit';

import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  translate,
  type Language,
  type MessageKey,
  type TranslationParams,
} from './translations';

const STORAGE_KEY = 'app-language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, params?: TranslationParams) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.some((item) => item.code === value);
}

function readStoredLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(stored)) return stored;
  } catch {
    // Storage can be unavailable (e.g. blocked cookies); fall back to the default.
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(readStoredLanguage);

  useEffect(() => {
    // Gravity UI components have their own en/ru strings; keep them in sync.
    configure({ lang: language, fallbackLang: DEFAULT_LANGUAGE });
    document.documentElement.lang = language;
    document.title = translate(language, 'app.title');
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // Ignore: the choice just won't survive a reload.
    }
  }, [language]);

  const t = useCallback(
    (key: MessageKey, params?: TranslationParams) => translate(language, key, params),
    [language],
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used inside <LanguageProvider>');
  }
  return context;
}
