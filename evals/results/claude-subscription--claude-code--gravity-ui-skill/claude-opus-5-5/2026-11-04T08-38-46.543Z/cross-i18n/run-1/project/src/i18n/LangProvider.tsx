import * as React from 'react';
import type {Params} from '@gravity-ui/i18n';

import {type AppKey, type AppLang, appKeyset, applyLang, initialLang} from './index';

interface LangContextValue {
    lang: AppLang;
    setLang: (lang: AppLang) => void;
    t: (key: AppKey, params?: Params) => string;
}

const LangContext = React.createContext<LangContextValue | null>(null);

export function LangProvider({children}: React.PropsWithChildren) {
    const [lang, setLangState] = React.useState<AppLang>(initialLang);

    const setLang = React.useCallback((next: AppLang) => {
        applyLang(next);
        setLangState(next);
    }, []);

    // `t` is recreated on language change so memoized consumers re-render too.
    const value = React.useMemo<LangContextValue>(
        () => ({lang, setLang, t: (key, params) => appKeyset(key, params)}),
        [lang, setLang],
    );

    return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useTranslation() {
    const context = React.useContext(LangContext);
    if (!context) {
        throw new Error('useTranslation must be used within LangProvider');
    }
    return context;
}
