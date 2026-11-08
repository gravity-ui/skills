import React from 'react';
import {I18N} from '@gravity-ui/i18n';

import en from './en.json';
import ru from './ru.json';

export type AppLang = 'en' | 'ru';

export const LANGS: AppLang[] = ['en', 'ru'];

const STORAGE_KEY = 'app-lang';
const DEFAULT_LANG: AppLang = 'en';

const i18n = new I18N({fallbackLang: DEFAULT_LANG});
i18n.registerKeysets('en', en);
i18n.registerKeysets('ru', ru);

function isLang(value: unknown): value is AppLang {
  return LANGS.includes(value as AppLang);
}

function detectInitialLang(): AppLang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isLang(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : DEFAULT_LANG;
}

type Params = Record<string, string | number>;

interface I18nContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: (key: keyof typeof en.app, params?: Params) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({children}: React.PropsWithChildren) {
  const [lang, setLangState] = React.useState<AppLang>(detectInitialLang);

  // Keep the I18N instance and <html lang> in sync with the state.
  i18n.setLang(lang);
  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = React.useCallback((next: AppLang) => {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
    setLangState(next);
  }, []);

  const value = React.useMemo<I18nContextValue>(() => {
    const keyset = i18n.keyset('app');
    return {lang, setLang, t: (key, params) => keyset(key, params)};
    // `lang` is a dependency so that consumers re-render with fresh translations.
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
