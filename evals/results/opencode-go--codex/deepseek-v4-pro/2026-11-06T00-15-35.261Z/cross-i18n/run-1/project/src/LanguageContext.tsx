import React, {createContext, useContext, useEffect, useMemo, useState} from 'react';

import {translations, type Language, type Translation} from './i18n';

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: Translation;
}

const STORAGE_KEY = 'app-language';

function readInitialLanguage(): Language {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved === 'en' || saved === 'ru') {
            return saved;
        }
    } catch {
        // localStorage can be unavailable; fall back to the default language.
    }

    return 'en';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: React.ReactNode}) {
    const [language, setLanguage] = useState<Language>(readInitialLanguage);

    useEffect(() => {
        document.documentElement.lang = language;

        try {
            window.localStorage.setItem(STORAGE_KEY, language);
        } catch {
            // Ignore storage errors in restricted environments.
        }
    }, [language]);

    const value = useMemo<LanguageContextValue>(
        () => ({language, setLanguage, t: translations[language]}),
        [language],
    );

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
    const context = useContext(LanguageContext);

    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }

    return context;
}
