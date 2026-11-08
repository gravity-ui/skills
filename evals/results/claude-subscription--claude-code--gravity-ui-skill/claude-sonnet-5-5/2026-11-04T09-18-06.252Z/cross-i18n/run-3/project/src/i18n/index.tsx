import React from 'react';
import {I18N} from '@gravity-ui/i18n';
import {Lang, configure} from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export const SUPPORTED_LANGS = [Lang.En, Lang.Ru] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'app-lang';

const i18n = new I18N({fallbackLang: Lang.En});
i18n.registerKeysets(Lang.En, en);
i18n.registerKeysets(Lang.Ru, ru);

function isSupported(value: unknown): value is AppLang {
  return SUPPORTED_LANGS.includes(value as AppLang);
}

function detectInitialLang(): AppLang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isSupported(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }
  const browser = typeof navigator === 'undefined' ? '' : navigator.language.slice(0, 2);
  return isSupported(browser) ? browser : Lang.En;
}

/** Applies the language to the app strings, built-in uikit components and <html lang>. */
function applyLang(lang: AppLang) {
  i18n.setLang(lang);
  configure({lang});
  document.documentElement.lang = lang;
}

type Translate = (key: string, params?: Record<string, string | number>) => string;

interface LangContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: Translate;
}

const LangContext = React.createContext<LangContextValue | null>(null);

export function LangProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = React.useState<AppLang>(() => {
    const initial = detectInitialLang();
    // Apply before the first render so children and uikit get the right strings immediately.
    applyLang(initial);
    return initial;
  });

  const setLang = React.useCallback((next: AppLang) => {
    applyLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setLangState(next);
  }, []);

  const value = React.useMemo<LangContextValue>(() => {
    const keyset = i18n.keyset('app');
    return {lang, setLang, t: (key, params) => keyset(key, params)};
  }, [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = React.useContext(LangContext);
  if (!ctx) {
    throw new Error('useLang must be used within LangProvider');
  }
  return ctx;
}
