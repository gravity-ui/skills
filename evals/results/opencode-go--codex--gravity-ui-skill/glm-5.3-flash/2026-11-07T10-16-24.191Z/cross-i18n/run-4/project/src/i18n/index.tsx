import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { I18N } from '@gravity-ui/i18n';
import { configure } from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export type AppLanguage = 'en' | 'ru';

type Localization = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
  i18n: I18N;
};

const i18n = new I18N();

i18n.registerKeysets('en', en);
i18n.registerKeysets('ru', ru);
i18n.setLang('en');

const LocalizationContext = createContext<Localization | null>(null);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  const value = useMemo<Localization>(
    () => ({
      language,
      setLanguage: (nextLanguage) => {
        i18n.setLang(nextLanguage);
        configure({ lang: nextLanguage });
        setLanguageState(nextLanguage);
      },
      i18n,
    }),
    [language],
  );

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error('useLocalization must be used within LocalizationProvider');
  }

  return context;
}
