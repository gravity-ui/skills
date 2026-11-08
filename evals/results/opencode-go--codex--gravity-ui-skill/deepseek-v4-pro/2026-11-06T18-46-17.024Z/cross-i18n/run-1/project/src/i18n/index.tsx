import {createContext, useContext, useState, useCallback, useMemo, type ReactNode} from 'react';
import {I18N} from '@gravity-ui/i18n';
import {Lang, configure} from '@gravity-ui/uikit';
import en from './keysets/en.json';
import ru from './keysets/ru.json';

export type SupportedLang = 'en' | 'ru';

const uikitLangMap: Record<SupportedLang, Lang> = {
  en: Lang.En,
  ru: Lang.Ru,
};

export const i18n = new I18N({
  lang: 'en',
  fallbackLang: 'en',
  data: {en, ru},
});

const appKeyset = i18n.keyset('app');

export function t(key: string, params?: Record<string, string | number>): string {
  return appKeyset(key, params);
}

function applyLang(lang: SupportedLang): void {
  i18n.setLang(lang);
  configure({lang: uikitLangMap[lang]});
}

interface LangContextValue {
  lang: SupportedLang;
  setLang: (lang: SupportedLang) => void;
}

const LangContext = createContext<LangContextValue | null>(null);

export function I18nProvider({children}: {children: ReactNode}) {
  const [lang, setLangState] = useState<SupportedLang>('en');

  const setLang = useCallback((next: SupportedLang) => {
    applyLang(next);
    setLangState(next);
  }, []);

  const value = useMemo<LangContextValue>(() => ({lang, setLang}), [lang, setLang]);

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang(): LangContextValue {
  const ctx = useContext(LangContext);
  if (!ctx) {
    throw new Error('useLang must be used inside I18nProvider');
  }
  return ctx;
}
