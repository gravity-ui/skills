import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

import {DEFAULT_LANG, LANG_STORAGE_KEY, detectInitialLang, translate} from './index';
import type {Lang, TranslateParams, TranslationKey} from './index';

export interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

export interface I18nProviderProps {
  children: React.ReactNode;
  /** Overrides the detected language (useful in tests). */
  initialLang?: Lang;
}

export function I18nProvider({children, initialLang}: I18nProviderProps) {
  const [lang, setLangState] = React.useState<Lang>(() => initialLang ?? detectInitialLang());

  React.useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage may be unavailable — the language still works for the current session.
    }
  }, [lang]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      lang,
      setLang: setLangState,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang],
  );

  return (
    <I18nContext.Provider value={value}>
      {/* Nested ThemeProvider passes the language to Gravity UI components
          (Select filter, clear buttons, Pagination, ClipboardButton tooltips, …). */}
      <ThemeProvider lang={lang} fallbackLang={DEFAULT_LANG}>
        {children}
      </ThemeProvider>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const context = React.useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}
