import React, {createContext, useCallback, useContext, useState} from 'react';
import {configure, getConfig, Lang} from '@gravity-ui/uikit';
import {I18N} from '@gravity-ui/i18n';

import {keysets} from './keysets';

const instance = new I18N({lang: getConfig().lang, fallbackLang: Lang.En});
instance.registerKeysets(Lang.En, keysets.en);
instance.registerKeysets(Lang.Ru, keysets.ru);

const typedI18n = instance.i18n.bind(instance);
const typedKeyset = instance.keyset.bind(instance);

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  i18n: typeof typedI18n;
  keyset: typeof typedKeyset;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({children}: {children: React.ReactNode}) {
  const [lang, setLangState] = useState<Lang>(getConfig().lang as Lang);

  const setLang = useCallback((newLang: Lang) => {
    configure({lang: newLang});
    instance.setLang(newLang);
    setLangState(newLang);
  }, []);

  return (
    <I18nContext.Provider value={{lang, setLang, i18n: typedI18n, keyset: typedKeyset}}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
}
