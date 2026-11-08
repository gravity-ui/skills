import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

import {
    DEFAULT_LANGUAGE,
    type Language,
    type MessageKey,
    isLanguage,
    translations,
} from './translations';

const STORAGE_KEY = 'app.language';

type Params = Record<string, string | number>;

export interface I18nContextValue {
    lang: Language;
    setLang: (lang: Language) => void;
    /** Translate a key. Pass `count` in params to select a plural form. */
    t: (key: MessageKey, params?: Params) => string;
}

const I18nContext = React.createContext<I18nContextValue | undefined>(undefined);

function readStoredLanguage(): Language | undefined {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isLanguage(stored) ? stored : undefined;
    } catch {
        return undefined;
    }
}

function detectLanguage(): Language {
    if (typeof window === 'undefined') {
        return DEFAULT_LANGUAGE;
    }
    const stored = readStoredLanguage();
    if (stored) {
        return stored;
    }
    const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
    return isLanguage(browserLang) ? browserLang : DEFAULT_LANGUAGE;
}

function interpolate(template: string, params?: Params) {
    if (!params) {
        return template;
    }
    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
    );
}

export function I18nProvider({children}: React.PropsWithChildren) {
    const [lang, setLangState] = React.useState<Language>(detectLanguage);

    const setLang = React.useCallback((next: Language) => {
        setLangState(next);
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch {
            // storage unavailable (private mode, etc.) — keep the in-memory choice
        }
    }, []);

    React.useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const value = React.useMemo<I18nContextValue>(() => {
        const messages = translations[lang];
        const pluralRules = new Intl.PluralRules(lang);

        const t: I18nContextValue['t'] = (key, params) => {
            const message = messages[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
            if (typeof message === 'string') {
                return interpolate(message, params);
            }
            const count = Number(params?.count ?? 0);
            const form = message[pluralRules.select(count)] ?? message.other;
            return interpolate(form, params);
        };

        return {lang, setLang, t};
    }, [lang, setLang]);

    return (
        <I18nContext.Provider value={value}>
            {/* Propagates the language to Gravity UI's built-in component texts */}
            <ThemeProvider lang={lang}>{children}</ThemeProvider>
        </I18nContext.Provider>
    );
}

export function useI18n(): I18nContextValue {
    const context = React.useContext(I18nContext);
    if (!context) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return context;
}
