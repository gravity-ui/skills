import React from 'react';
import {I18N} from '@gravity-ui/i18n';
import {configure, ThemeProvider} from '@gravity-ui/uikit';
import type {ThemeProviderProps} from '@gravity-ui/uikit';

import {APP_LANGS, keysets} from './keysets';
import type {AppLang} from './keysets';

const STORAGE_KEY = 'app-lang';

const i18n = new I18N({fallbackLang: 'en'});
for (const lang of APP_LANGS) {
  i18n.registerKeysets(lang, keysets[lang]);
}

function isAppLang(value: unknown): value is AppLang {
  return APP_LANGS.includes(value as AppLang);
}

function detectInitialLang(): AppLang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isAppLang(stored)) {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

interface LangContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
}

const LangContext = React.createContext<LangContextValue | null>(null);

/** Owns the current language and passes it to uikit components via ThemeProvider. */
export function LangThemeProvider({
  children,
  ...themeProps
}: Omit<ThemeProviderProps, 'lang'>) {
  const [lang, setLangState] = React.useState<AppLang>(detectInitialLang);

  // Sync the module-level i18n instance during render so children
  // read the right strings in the very same render pass.
  i18n.setLang(lang);

  React.useEffect(() => {
    configure({lang}); // keeps uikit's global i18n in sync
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  const value = React.useMemo(() => ({lang, setLang: setLangState}), [lang]);

  return (
    <LangContext.Provider value={value}>
      <ThemeProvider {...themeProps} lang={lang}>
        {children}
      </ThemeProvider>
    </LangContext.Provider>
  );
}

export function useLanguage(): LangContextValue {
  const ctx = React.useContext(LangContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LangThemeProvider');
  }
  return ctx;
}

type Params = Record<string, string | number>;

/** Returns a translate function for the `app` keyset; re-renders on language change. */
export function useTranslation() {
  const {lang} = useLanguage();
  return React.useMemo(() => {
    const keyset = i18n.keyset('app');
    void lang; // translations resolve against the current i18n language
    return (key: string, params?: Params) => keyset(key, params);
  }, [lang]);
}

export type {AppLang};
