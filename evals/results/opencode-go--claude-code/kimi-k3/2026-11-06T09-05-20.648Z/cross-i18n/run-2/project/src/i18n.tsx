import React, {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';

const STORAGE_KEY = 'app-language';

const translations = {
    en: {
        appTitle: 'Interface Language Demo',
        subtitle: 'Switch the interface language between English and Russian.',
        languageLabel: 'Interface language',
        english: 'English',
        russian: 'Russian',
        greeting: 'Hello!',
        intro: 'This demo shows how the whole interface reacts to a language change instantly.',
        nameLabel: 'Name',
        namePlaceholder: 'Enter your name',
        commentLabel: 'Comment',
        commentPlaceholder: 'Write something…',
        save: 'Save',
        reset: 'Reset',
        savedMessage: 'Saved successfully',
        resetMessage: 'Form cleared',
        charactersTyped: 'Characters typed',
        footer: 'Your choice is remembered between visits.',
    },
    ru: {
        appTitle: 'Демо переключения языка',
        subtitle: 'Переключайте язык интерфейса между английским и русским.',
        languageLabel: 'Язык интерфейса',
        english: 'Английский',
        russian: 'Русский',
        greeting: 'Привет!',
        intro: 'Это демо показывает, как весь интерфейс мгновенно реагирует на смену языка.',
        nameLabel: 'Имя',
        namePlaceholder: 'Введите ваше имя',
        commentLabel: 'Комментарий',
        commentPlaceholder: 'Напишите что-нибудь…',
        save: 'Сохранить',
        reset: 'Сбросить',
        savedMessage: 'Успешно сохранено',
        resetMessage: 'Форма очищена',
        charactersTyped: 'Введено символов',
        footer: 'Ваш выбор запоминается между визитами.',
    },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];

function detectInitialLanguage(): Language {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored === 'en' || stored === 'ru') {
            return stored;
        }
    } catch {
        // localStorage may be unavailable (e.g. SSR or private mode) — fall through.
    }
    return window.navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

interface LanguageContextValue {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({children}: {children: React.ReactNode}) {
    const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

    const setLanguage = useCallback((next: Language) => {
        setLanguageState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Ignore persistence failures — the switch still works for the session.
        }
    }, []);

    // Keep Gravity UI's own component strings (e.g. built-in labels) in sync.
    useEffect(() => {
        configure({lang: language});
        document.documentElement.lang = language;
    }, [language]);

    const t = useCallback((key: TranslationKey) => translations[language][key], [language]);

    const value = useMemo(() => ({language, setLanguage, t}), [language, setLanguage, t]);

    return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return ctx;
}
