import * as React from 'react';
import {ThemeProvider, configure} from '@gravity-ui/uikit';
import type {Params} from '@gravity-ui/i18n';

import {
  type AppKey,
  type AppLang,
  FALLBACK_LANG,
  detectInitialLang,
  i18n,
  persistLang,
} from './index';

export interface LangContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  /** Translate a key from the `app` keyset in the current language. */
  t: (key: AppKey, params?: Params) => string;
}

const LangContext = React.createContext<LangContextValue | undefined>(undefined);

export function LangProvider({children}: React.PropsWithChildren) {
  const [lang, setLangState] = React.useState<AppLang>(detectInitialLang);

  // Keep the global @gravity-ui/i18n instance, the uikit config (used by
  // non-React consumers such as the Toaster) and the <html lang> attribute in
  // sync with React state.
  React.useEffect(() => {
    i18n.setLang(lang);
    configure({lang, fallbackLang: FALLBACK_LANG});
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback((next: AppLang) => {
    persistLang(next);
    setLangState(next);
  }, []);

  const value = React.useMemo<LangContextValue>(() => {
    // Translate against the explicit language so the first render after a
    // switch is already correct, before the effect above has run.
    const t = (key: AppKey, params?: Params) => {
      const previous = i18n.lang;
      i18n.setLang(lang);
      try {
        return i18n.i18n('app', key, params);
      } finally {
        if (previous) {
          i18n.setLang(previous);
        }
      }
    };
    return {lang, setLang, t};
  }, [lang, setLang]);

  return (
    <LangContext.Provider value={value}>
      <ThemeProvider lang={lang} fallbackLang={FALLBACK_LANG}>
        {children}
      </ThemeProvider>
    </LangContext.Provider>
  );
}

export function useI18n(): LangContextValue {
  const context = React.useContext(LangContext);
  if (!context) {
    throw new Error('useI18n must be used inside <LangProvider>');
  }
  return context;
}
