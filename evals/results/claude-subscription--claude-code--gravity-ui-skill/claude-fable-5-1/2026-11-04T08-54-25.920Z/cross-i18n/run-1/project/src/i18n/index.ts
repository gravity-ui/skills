import {I18N} from '@gravity-ui/i18n';
import {Lang, configure, getConfig, useLang} from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export type AppLang = `${Lang}`;

export const SUPPORTED_LANGS: readonly AppLang[] = [Lang.En, Lang.Ru];
export const DEFAULT_LANG: AppLang = Lang.En;

const STORAGE_KEY = 'app-lang';

export function isAppLang(value: unknown): value is AppLang {
    return typeof value === 'string' && (SUPPORTED_LANGS as readonly string[]).includes(value);
}

function readStoredLang(): AppLang | undefined {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        return isAppLang(stored) ? stored : undefined;
    } catch {
        return undefined;
    }
}

function detectBrowserLang(): AppLang | undefined {
    const candidates = typeof navigator === 'undefined' ? [] : navigator.languages ?? [navigator.language];
    for (const tag of candidates) {
        const base = tag.toLowerCase().split('-')[0];
        if (isAppLang(base)) {
            return base;
        }
    }
    return undefined;
}

// Application-level i18n instance (uikit has its own, synced through `configure`).
export const i18n = new I18N({lang: DEFAULT_LANG, fallbackLang: DEFAULT_LANG});
i18n.registerKeysets(Lang.En, en);
i18n.registerKeysets(Lang.Ru, ru);

type AppKeys = keyof typeof en.app;
export const t = i18n.keyset<AppKeys>('app');

/**
 * Switches the interface language everywhere:
 * built-in uikit component texts (via `configure`), application strings and the `<html lang>` attribute.
 * Components re-render automatically through `useAppLang` (backed by uikit's `useLang`).
 */
export function setAppLang(lang: AppLang) {
    configure({lang, fallbackLang: DEFAULT_LANG});
    i18n.setLang(lang);
    i18n.setFallbackLang(DEFAULT_LANG);
    if (typeof document !== 'undefined') {
        document.documentElement.lang = lang;
    }
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // storage may be unavailable (private mode, disabled cookies) — language still works for the session
    }
}

export function getAppLang(): AppLang {
    const {lang} = getConfig();
    return isAppLang(lang) ? lang : DEFAULT_LANG;
}

/** Call once at app start-up, before the first render. */
export function initAppLang() {
    setAppLang(readStoredLang() ?? detectBrowserLang() ?? DEFAULT_LANG);
}

/** Current language; subscribes the component to language changes. */
export function useAppLang(): AppLang {
    const {lang} = useLang();
    return isAppLang(lang) ? lang : DEFAULT_LANG;
}
