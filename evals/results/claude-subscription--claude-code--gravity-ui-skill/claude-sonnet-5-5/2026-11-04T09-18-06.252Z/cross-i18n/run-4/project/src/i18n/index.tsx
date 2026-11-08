import React from 'react';
import {I18N, type Params} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

import en from './en.json';
import ru from './ru.json';

export const LANGS = ['en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

const STORAGE_KEY = 'app-lang';

const i18n = new I18N();
i18n.registerKeysets('en', en);
i18n.registerKeysets('ru', ru);
i18n.setFallbackLang('en');

function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable — fall through to the browser language
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

// Applies the language to the app texts, to uikit's built-in texts and to <html lang>.
function applyLang(lang: Lang) {
  i18n.setLang(lang);
  configure({lang, fallbackLang: 'en'});
  document.documentElement.lang = lang;
}

type Translate = (key: string, params?: Params) => string;

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translate;
}

const LangContext = React.createContext<LangContextValue | null>(null);

export function LangProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    const initial = detectInitialLang();
    // Must run before the first render so that children get the right texts.
    applyLang(initial);
    return initial;
  });

  const setLang = React.useCallback((next: Lang) => {
    applyLang(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore storage errors
    }
    setLangState(next);
  }, []);

  const value = React.useMemo<LangContextValue>(() => {
    const keyset = i18n.keyset('app');
    return {
      lang,
      setLang,
      // `lang` is a dependency so that `t` identity changes together with the language.
      t: (key, params) => keyset(key, params),
    };
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

export function langLabel(lang: Lang): string {
  return i18n.i18n('lang', lang);
}
