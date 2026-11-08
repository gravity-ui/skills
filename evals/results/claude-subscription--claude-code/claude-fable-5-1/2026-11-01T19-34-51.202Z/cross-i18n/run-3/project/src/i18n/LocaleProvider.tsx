import React from 'react';
import { configure as configureGravity } from '@gravity-ui/uikit';

import {
  DEFAULT_LANG,
  LANG_STORAGE_KEY,
  type Lang,
  type MessageKey,
  type TranslateParams,
  resolveInitialLang,
  translate,
} from './locales';

interface LocaleContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, params?: TranslateParams) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function readStoredLang(): string | null {
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredLang(lang: Lang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Storage may be unavailable (private mode, quota); the choice just won't persist.
  }
}

/**
 * Applies the language to everything outside React state: Gravity UI's own
 * i18n (Pagination, Select, Table settings, ...) and the document `lang` attribute.
 * Must run before the components render, so it is called synchronously, not in an effect.
 */
function applyLang(lang: Lang) {
  configureGravity({ lang, fallbackLang: DEFAULT_LANG });
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
}

function getInitialLang(): Lang {
  const browserLangs =
    typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
  return resolveInitialLang(readStoredLang(), browserLangs);
}

export function LocaleProvider({
  children,
  initialLang,
}: {
  children: React.ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = React.useState<Lang>(() => {
    const initial = initialLang ?? getInitialLang();
    applyLang(initial);
    return initial;
  });

  const setLang = React.useCallback((next: Lang) => {
    applyLang(next);
    writeStoredLang(next);
    setLangState(next);
  }, []);

  const value = React.useMemo<LocaleContextValue>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
    }),
    [lang, setLang],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useI18n must be used inside <LocaleProvider>');
  }
  return ctx;
}
