import * as React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';
import type {ThemeProviderProps} from '@gravity-ui/uikit';

import {type AppKeysets, type AppLang, applyLang, getInitialLang, i18n} from './index';

type Params = Record<string, string | number>;

interface LangContextValue {
    lang: AppLang;
    setLang: (lang: AppLang) => void;
    t: <K extends keyof AppKeysets>(
        keyset: K,
        key: Extract<keyof AppKeysets[K], string>,
        params?: Params,
    ) => string;
}

const AppLangContext = React.createContext<LangContextValue | undefined>(undefined);

const initialLang = getInitialLang();
applyLang(initialLang);

interface LangProviderProps {
    theme: ThemeProviderProps['theme'];
    children: React.ReactNode;
}

/**
 * Holds the current interface language and renders ThemeProvider with it,
 * so both app strings and uikit's built-in strings re-render on switch.
 */
export function LangProvider({theme, children}: LangProviderProps) {
    const [lang, setLangState] = React.useState<AppLang>(initialLang);

    const setLang = React.useCallback((next: AppLang) => {
        applyLang(next);
        setLangState(next);
    }, []);

    const value = React.useMemo<LangContextValue>(
        () => ({
            lang,
            setLang,
            // A new `t` per language makes consumers re-render on switch.
            t: (keyset, key, params) => i18n.i18n(keyset, key, params),
        }),
        [lang, setLang],
    );

    return (
        <AppLangContext.Provider value={value}>
            <ThemeProvider theme={theme} lang={lang} fallbackLang="en">
                {children}
            </ThemeProvider>
        </AppLangContext.Provider>
    );
}

export function useAppLang() {
    const context = React.useContext(AppLangContext);
    if (!context) {
        throw new Error('useAppLang must be used inside <LangProvider>');
    }
    return context;
}
