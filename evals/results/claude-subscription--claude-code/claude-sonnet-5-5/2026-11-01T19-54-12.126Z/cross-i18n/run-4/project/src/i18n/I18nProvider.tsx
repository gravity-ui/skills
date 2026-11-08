import React from 'react';
import { configure } from '@gravity-ui/uikit';

import { LANGUAGES, messages, type Language, type MessageKey } from './messages';

const STORAGE_KEY = 'app-language';

type Params = Record<string, string | number>;

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey, params?: Params) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

function isLanguage(value: unknown): value is Language {
  return LANGUAGES.includes(value as Language);
}

function detectInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

/** Applies the language to Gravity UI built-in texts and to the <html lang> attribute. */
function applyLanguage(language: Language) {
  configure({ lang: language });
  document.documentElement.lang = language;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(() => {
    const initial = detectInitialLanguage();
    // Configure before the first render so uikit components start in the right language.
    applyLanguage(initial);
    return initial;
  });

  const setLanguage = React.useCallback((next: Language) => {
    applyLanguage(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence errors
    }
    setLanguageState(next);
  }, []);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: (key, params) => {
        const template = messages[language][key];
        return params
          ? template.replace(/\{(\w+)\}/g, (match, name: string) =>
              name in params ? String(params[name]) : match,
            )
          : template;
      },
    }),
    [language, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
