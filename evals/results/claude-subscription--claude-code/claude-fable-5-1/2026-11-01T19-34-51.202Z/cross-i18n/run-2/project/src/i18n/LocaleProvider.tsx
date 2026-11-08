import * as React from 'react';
import { configure } from '@gravity-ui/uikit';

import { translate, type TranslateParams } from './dictionaries';
import type { TranslationKey } from './en';
import { DEFAULT_LANG, LANG_STORAGE_KEY, isAppLang, type AppLang } from './types';

interface LocaleContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: (key: TranslationKey, params?: TranslateParams) => string;
}

const LocaleContext = React.createContext<LocaleContextValue | null>(null);

function readStoredLang(): AppLang | null {
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    return isAppLang(stored) ? stored : null;
  } catch {
    return null;
  }
}

function detectBrowserLang(): AppLang {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANG;
  }
  const preferred = (navigator.languages ?? [navigator.language]).map((l) =>
    l.toLowerCase().split('-')[0],
  );
  return preferred.find(isAppLang) ?? DEFAULT_LANG;
}

function resolveInitialLang(): AppLang {
  return readStoredLang() ?? detectBrowserLang();
}

/** Applies the language to Gravity UI so built-in component texts follow the app language. */
function applyUikitLang(lang: AppLang) {
  configure({ lang, fallbackLang: DEFAULT_LANG });
}

interface LocaleProviderProps {
  children: React.ReactNode;
  /** Overrides stored/browser detection; useful for tests. */
  initialLang?: AppLang;
}

export function LocaleProvider({ children, initialLang }: LocaleProviderProps) {
  const [lang, setLangState] = React.useState<AppLang>(() => {
    const initial = initialLang ?? resolveInitialLang();
    // Gravity UI reads its config at render time, so it must be set before
    // the first render of any child component.
    applyUikitLang(initial);
    return initial;
  });

  const setLang = React.useCallback((next: AppLang) => {
    // Update the library config synchronously, before React re-renders children.
    applyUikitLang(next);
    setLangState(next);
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // Storage may be unavailable (private mode, disabled cookies); ignore.
    }
  }, [lang]);

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

export function useLocale(): LocaleContextValue {
  const ctx = React.useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within <LocaleProvider>');
  }
  return ctx;
}

export function useTranslation() {
  return useLocale().t;
}
