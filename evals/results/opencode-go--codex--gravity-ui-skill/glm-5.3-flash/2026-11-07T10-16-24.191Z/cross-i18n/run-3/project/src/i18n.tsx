import {createContext, useContext, useEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {configure} from '@gravity-ui/uikit';
import {I18N} from '@gravity-ui/i18n';

export type AppLanguage = 'en' | 'ru';

const defaultLanguage: AppLanguage = 'en';

const i18nInstance = new I18N({
    fallbackLang: defaultLanguage,
    lang: defaultLanguage,
});

i18nInstance.registerKeysets('en', {
    interface: {
        choose_language: 'Choose interface language',
        language_en: 'English',
        language_ru: 'Russian',
    },
});

i18nInstance.registerKeysets('ru', {
    interface: {
        choose_language: 'Выберите язык интерфейса',
        language_en: 'Английский',
        language_ru: 'Русский',
    },
});

configure({lang: defaultLanguage});

type AppLanguageContextValue = {
    language: AppLanguage;
    setLanguage: (language: AppLanguage) => void;
};

const AppLanguageContext = createContext<AppLanguageContextValue | null>(null);

export function AppLanguageProvider({children}: {children: ReactNode}) {
    const [language, setLanguage] = useState<AppLanguage>(defaultLanguage);

    useEffect(() => {
        i18nInstance.setLang(language);
        configure({lang: language});
    }, [language]);

    const value = useMemo(() => ({language, setLanguage}), [language]);

    return <AppLanguageContext.Provider value={value}>{children}</AppLanguageContext.Provider>;
}

export function useAppLanguage() {
    const context = useContext(AppLanguageContext);

    if (!context) {
        throw new Error('useAppLanguage must be used within AppLanguageProvider');
    }

    return context;
}

export const i18n = i18nInstance.i18n.bind(i18nInstance);
