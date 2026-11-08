import * as React from 'react';
import { Lang, ThemeProvider, configure } from '@gravity-ui/uikit';

export const SUPPORTED_LANGS = [Lang.En, Lang.Ru] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'app-lang';
const FALLBACK_LANG: AppLang = Lang.En;

function isAppLang(value: unknown): value is AppLang {
  return SUPPORTED_LANGS.includes(value as AppLang);
}

function detectInitialLang(): AppLang {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isAppLang(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode, sandboxed iframe)
  }
  const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
  return isAppLang(browserLang) ? browserLang : FALLBACK_LANG;
}

interface LangContextValue {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
}

const AppLangContext = React.createContext<LangContextValue | null>(null);

export function useAppLang(): LangContextValue {
  const ctx = React.useContext(AppLangContext);
  if (!ctx) throw new Error('useAppLang must be used inside <LangProvider>');
  return ctx;
}

interface LangProviderProps {
  theme?: React.ComponentProps<typeof ThemeProvider>['theme'];
  children: React.ReactNode;
}

/**
 * Holds the current UI language and passes it to Gravity UI's ThemeProvider.
 *
 * The `lang` prop of ThemeProvider is what makes both Gravity UI components and
 * our own keysets (via `useTranslation`) re-render on change. `configure()`
 * alone is not enough: it mutates the global config in place, so subscribed
 * components don't see a new snapshot and won't re-render. We still call it to
 * keep the global config in sync for code running outside the React tree.
 */
export function LangProvider({ theme = 'light', children }: LangProviderProps) {
  const [lang, setLangState] = React.useState<AppLang>(detectInitialLang);

  React.useEffect(() => {
    configure({ lang, fallbackLang: FALLBACK_LANG });
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore persistence errors
    }
  }, [lang]);

  const value = React.useMemo<LangContextValue>(() => ({ lang, setLang: setLangState }), [lang]);

  return (
    <AppLangContext.Provider value={value}>
      <ThemeProvider theme={theme} lang={lang} fallbackLang={FALLBACK_LANG}>
        {children}
      </ThemeProvider>
    </AppLangContext.Provider>
  );
}
