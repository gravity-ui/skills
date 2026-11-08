import {createContext, useContext, useEffect, useMemo, useState, type ReactNode} from 'react';
import {configure, type ControlGroupOption} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';

export interface Messages {
    title: string;
    description: string;
    languageLabel: string;
    currentLanguage: string;
    english: string;
    russian: string;
    sampleTitle: string;
    sampleText: string;
}

const LANGUAGE_STORAGE_KEY = 'app-language';

const translations: Record<Language, Messages> = {
    en: {
        title: 'Language settings',
        description:
            'Choose the language used across the app. Your selection is saved in this browser.',
        languageLabel: 'Interface language',
        currentLanguage: 'Current language',
        english: 'English',
        russian: 'Russian',
        sampleTitle: 'Welcome!',
        sampleText:
            'This text updates immediately when you switch the interface language.',
    },
    ru: {
        title: 'Настройки языка',
        description:
            'Выберите язык интерфейса приложения. Выбранный язык сохраняется в этом браузере.',
        languageLabel: 'Язык интерфейса',
        currentLanguage: 'Текущий язык',
        english: 'Английский',
        russian: 'Русский',
        sampleTitle: 'Добро пожаловать!',
        sampleText:
            'Этот текст сразу обновляется при переключении языка интерфейса.',
    },
};

export const LANGUAGE_OPTIONS: ControlGroupOption<Language>[] = [
    {value: 'en', content: 'English'},
    {value: 'ru', content: 'Русский'},
];

function getInitialLanguage(): Language {
    try {
        const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
        if (stored === 'en' || stored === 'ru') {
            return stored;
        }
    } catch {
        // localStorage can be unavailable in some browser contexts.
    }

    if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')) {
        return 'ru';
    }

    return 'en';
}

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: Messages;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({children}: {children: ReactNode}) {
    const [language, setLanguage] = useState<Language>(getInitialLanguage);

    useEffect(() => {
        configure({lang: language});
        document.documentElement.lang = language;
        document.title = translations[language].title;

        try {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        } catch {
            // Ignore storage failures and keep the in-memory language active.
        }
    }, [language]);

    const value = useMemo<LanguageContextValue>(
        () => ({
            language,
            setLanguage,
            t: translations[language],
        }),
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
