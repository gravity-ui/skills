import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { configure } from '@gravity-ui/uikit';

import { LANGS, messages } from './messages';
import type { Lang, MessageKey } from './messages';

const STORAGE_KEY = 'app-lang';

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

function readStoredLang(): Lang | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return isLang(value) ? value : null;
  } catch {
    // Storage can be unavailable (e.g. blocked cookies); fall back to detection.
    return null;
  }
}

/** Saved choice first, then the browser language, then English. */
function getInitialLang(): Lang {
  const stored = readStoredLang();
  if (stored) return stored;
  return navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    // Also switches the built-in texts of Gravity UI components.
    configure({ lang });
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // The choice still applies for this page session.
    }
  }, []);

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = messages[lang];
    return { lang, setLang, t: (key) => dictionary[key] };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
