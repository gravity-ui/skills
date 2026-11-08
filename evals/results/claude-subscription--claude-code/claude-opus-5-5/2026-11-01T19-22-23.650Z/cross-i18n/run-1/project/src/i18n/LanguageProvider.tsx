import * as React from 'react';
import { Lang, ThemeProvider, configure } from '@gravity-ui/uikit';

export const SUPPORTED_LANGS = [Lang.En, Lang.Ru] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'app-lang';

function isSupportedLang(value: unknown): value is AppLang {
  return SUPPORTED_LANGS.includes(value as AppLang);
}

function getInitialLang(): AppLang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (isSupportedLang(saved)) {
      return saved;
    }
  } catch {
    // localStorage may be unavailable (privacy mode etc.) — ignore.
  }
  const browserLang = typeof navigator === 'undefined' ? '' : navigator.language;
  return browserLang.toLowerCase().startsWith('ru') ? Lang.Ru : Lang.En;
}

interface LanguageContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: React.PropsWithChildren) {
  const [lang, setLangState] = React.useState<AppLang>(getInitialLang);

  const setLang = React.useCallback((next: AppLang) => {
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    // Global config is used by non-React translation calls (e.g. toasts).
    configure({ lang, fallbackLang: Lang.En });
    document.documentElement.lang = lang;
  }, [lang]);

  const value = React.useMemo(() => ({ lang, setLang }), [lang, setLang]);

  return (
    <LanguageContext.Provider value={value}>
      {/* Nested ThemeProvider inherits the theme and passes `lang` to all Gravity UI components via context. */}
      <ThemeProvider lang={lang} fallbackLang={Lang.En}>
        {children}
      </ThemeProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
