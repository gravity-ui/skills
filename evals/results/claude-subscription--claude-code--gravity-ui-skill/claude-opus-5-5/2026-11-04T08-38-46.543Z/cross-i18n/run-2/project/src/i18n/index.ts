import * as React from 'react';
import { I18N } from '@gravity-ui/i18n';
import type { Params } from '@gravity-ui/i18n';
import { Lang, configure, useLang } from '@gravity-ui/uikit';

import { en } from './keysets/en';
import type { AppKeysets } from './keysets/en';
import { ru } from './keysets/ru';

export const SUPPORTED_LANGS = [Lang.En, Lang.Ru] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'app-lang';
const FALLBACK_LANG: AppLang = Lang.En;

function isAppLang(value: unknown): value is AppLang {
    return SUPPORTED_LANGS.includes(value as AppLang);
}

function readStoredLang(): AppLang | undefined {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isAppLang(stored) ? stored : undefined;
    } catch {
        return undefined; // storage may be unavailable (privacy mode, sandboxed iframe)
    }
}

function detectBrowserLang(): AppLang | undefined {
    const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
    return isAppLang(browserLang) ? browserLang : undefined;
}

// App strings live in their own I18N instance; uikit keeps its own for built-in component texts.
const i18n = new I18N({ fallbackLang: FALLBACK_LANG });
i18n.registerKeysets(Lang.En, en);
i18n.registerKeysets(Lang.Ru, ru);

/**
 * Switches the interface language: app strings, uikit built-in strings, <html lang>,
 * and remembers the choice. Every component using `useTranslation` re-renders.
 */
export function setLang(lang: AppLang) {
    // Update app strings first: `configure` synchronously notifies uikit subscribers,
    // which triggers the re-render that reads them.
    i18n.setLang(lang);
    configure({ lang, fallbackLang: FALLBACK_LANG });
    document.documentElement.lang = lang;

    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // ignore: language still switches for the current session
    }
}

/** Must be called once before the first render. */
export function initI18n() {
    setLang(readStoredLang() ?? detectBrowserLang() ?? FALLBACK_LANG);
}

/** Current interface language (reactive). */
export function useAppLang(): AppLang {
    const { lang } = useLang();
    return isAppLang(lang) ? lang : FALLBACK_LANG;
}

/** Translation function for a keyset; re-renders the component when the language changes. */
export function useTranslation<K extends keyof AppKeysets>(keysetName: K) {
    const lang = useAppLang();

    // `lang` is a dependency so consumers get a new `t` (and their memoized values recompute) on switch.
    return React.useCallback(
        (key: Extract<keyof AppKeysets[K], string>, params?: Params) => i18n.i18n(keysetName, key, params),
        [keysetName, lang],
    );
}
