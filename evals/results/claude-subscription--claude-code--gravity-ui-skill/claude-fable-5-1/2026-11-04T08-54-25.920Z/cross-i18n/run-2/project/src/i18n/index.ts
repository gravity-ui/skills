import {I18N} from '@gravity-ui/i18n';
import type {Params} from '@gravity-ui/i18n';
import {configure, useLang} from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export const LANGS = ['en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';
const STORAGE_KEY = 'app-lang';

export function isLang(value: unknown): value is Lang {
    return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

// Application string catalog. uikit keeps its own I18N instance for component strings;
// both are driven by the same `configure({lang})` call in `setLang` below.
const i18nInstance = new I18N({
    lang: DEFAULT_LANG,
    fallbackLang: DEFAULT_LANG,
    data: {en, ru},
});

type AppKey = keyof typeof en.app;

/** Typed translation function for the `app` keyset: `t('title')`, `t('label_items', {count})`. */
export function t(key: AppKey, params?: Params): string {
    return i18nInstance.i18n('app', key, params);
}

function readStoredLang(): Lang | null {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isLang(stored) ? stored : null;
    } catch {
        return null;
    }
}

function detectBrowserLang(): Lang {
    const candidate = window.navigator.language?.slice(0, 2).toLowerCase();
    return isLang(candidate) ? candidate : DEFAULT_LANG;
}

/**
 * Switch the interface language: app strings, uikit component strings
 * (via `configure`), the document `lang` attribute, and the persisted choice.
 */
export function setLang(lang: Lang) {
    i18nInstance.setLang(lang);
    configure({lang, fallbackLang: DEFAULT_LANG});
    document.documentElement.lang = lang;
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // storage is unavailable (private mode, quota) — language still switches for this session
    }
}

/** Call once before the first render. */
export function initLang() {
    setLang(readStoredLang() ?? detectBrowserLang());
}

/**
 * Current interface language. Backed by uikit's language store, so every
 * component using this hook re-renders when `setLang` is called.
 */
export function useAppLang(): Lang {
    const {lang} = useLang();
    return isLang(lang) ? lang : DEFAULT_LANG;
}
