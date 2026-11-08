import * as React from 'react';

import {DEFAULT_LANG, applyLang, readStoredLang} from './index';
import type {AppLang} from './index';

interface LangContextValue {
    lang: AppLang;
    setLang: (lang: AppLang) => void;
}

const LangContext = React.createContext<LangContextValue>({
    lang: DEFAULT_LANG,
    setLang: () => {},
});

const initialLang = readStoredLang();
applyLang(initialLang);

export function LangProvider({children}: {children: React.ReactNode}) {
    const [lang, setLangState] = React.useState<AppLang>(initialLang);

    const setLang = React.useCallback((next: AppLang) => {
        applyLang(next);
        setLangState(next);
    }, []);

    const value = React.useMemo(() => ({lang, setLang}), [lang, setLang]);

    // `key` remounts the subtree on language change so that uikit components
    // re-read their keysets after `configure({lang})`.
    return (
        <LangContext.Provider value={value}>
            <React.Fragment key={lang}>{children}</React.Fragment>
        </LangContext.Provider>
    );
}

export function useLang() {
    return React.useContext(LangContext);
}
