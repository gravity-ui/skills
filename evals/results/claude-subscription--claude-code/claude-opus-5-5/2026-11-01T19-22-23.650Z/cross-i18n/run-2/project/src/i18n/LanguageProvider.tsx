import * as React from 'react';
import {ThemeProvider, configure} from '@gravity-ui/uikit';

import {
    DEFAULT_LANGUAGE,
    type Language,
    type TranslationKey,
    isLanguage,
    translations,
} from './translations';

const STORAGE_KEY = 'app.language';

type TranslateParams = Record<string, string | number>;

interface LanguageContextValue {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: TranslationKey, params?: TranslateParams) => string;
}

const LanguageContext = React.createContext<LanguageContextValue | undefined>(undefined);

function readStoredLanguage(): Language | undefined {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isLanguage(stored) ? stored : undefined;
    } catch {
        // localStorage может быть недоступен (приватный режим, SSR, политика безопасности).
        return undefined;
    }
}

function detectBrowserLanguage(): Language | undefined {
    if (typeof navigator === 'undefined') {
        return undefined;
    }
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const candidate of candidates) {
        const base = candidate?.toLowerCase().split('-')[0];
        if (isLanguage(base)) {
            return base;
        }
    }
    return undefined;
}

function getInitialLanguage(): Language {
    return readStoredLanguage() ?? detectBrowserLanguage() ?? DEFAULT_LANGUAGE;
}

function interpolate(template: string, params?: TranslateParams): string {
    if (!params) {
        return template;
    }
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}

export function LanguageProvider({children}: React.PropsWithChildren) {
    const [lang, setLangState] = React.useState<Language>(getInitialLanguage);

    const setLang = React.useCallback((next: Language) => {
        setLangState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // Не удалось сохранить — язык всё равно переключится в рамках сессии.
        }
    }, []);

    React.useEffect(() => {
        document.documentElement.lang = lang;
        // Синхронизируем глобальную конфигурацию Gravity UI для кода, работающего вне React-контекста.
        configure({lang});
    }, [lang]);

    const value = React.useMemo<LanguageContextValue>(
        () => ({
            lang,
            setLang,
            t: (key, params) =>
                interpolate(translations[lang][key] ?? translations[DEFAULT_LANGUAGE][key], params),
        }),
        [lang, setLang],
    );

    return (
        <LanguageContext.Provider value={value}>
            {/* Проп lang передаёт язык встроенным компонентам Gravity UI (Pagination, Select, Dialog и т.д.). */}
            <ThemeProvider lang={lang} fallbackLang={DEFAULT_LANGUAGE}>
                {children}
            </ThemeProvider>
        </LanguageContext.Provider>
    );
}

export function useTranslation(): LanguageContextValue {
    const context = React.useContext(LanguageContext);
    if (!context) {
        throw new Error('useTranslation must be used within LanguageProvider');
    }
    return context;
}
