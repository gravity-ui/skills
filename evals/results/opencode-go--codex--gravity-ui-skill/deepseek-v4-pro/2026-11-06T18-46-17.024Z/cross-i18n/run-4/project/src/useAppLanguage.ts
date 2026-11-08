import { useCallback, useEffect, useState } from 'react';
import { configure, Lang } from '@gravity-ui/uikit';
import type { AppLang } from './i18n';

const STORAGE_KEY = 'app-language';

function isAppLang(value: string | null): value is AppLang {
    return value === 'en' || value === 'ru';
}

function readInitialLang(): AppLang {
    if (typeof window === 'undefined') {
        return Lang.En;
    }
    return isAppLang(window.localStorage.getItem(STORAGE_KEY)) ? (window.localStorage.getItem(STORAGE_KEY) as AppLang) : Lang.En;
}

export function useAppLanguage() {
    const [lang, setLang] = useState<AppLang>(readInitialLang);

    useEffect(() => {
        configure({ lang, fallbackLang: Lang.En });
    }, [lang]);

    const changeLanguage = useCallback((next: AppLang) => {
        setLang(next);
        window.localStorage.setItem(STORAGE_KEY, next);
    }, []);

    return { lang, changeLanguage };
}
