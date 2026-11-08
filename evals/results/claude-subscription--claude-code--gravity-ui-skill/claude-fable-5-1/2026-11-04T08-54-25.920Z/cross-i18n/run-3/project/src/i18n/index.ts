import {I18N} from '@gravity-ui/i18n';
import {Lang, configure} from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export type AppLang = `${Lang}`;

export const SUPPORTED_LANGS: AppLang[] = [Lang.En, Lang.Ru];
export const DEFAULT_LANG: AppLang = Lang.En;
const STORAGE_KEY = 'app-lang';

export const i18nInstance = new I18N({
    lang: DEFAULT_LANG,
    fallbackLang: DEFAULT_LANG,
    data: {en, ru},
});

export const i18n = i18nInstance.keyset<keyof typeof en.app>('app');

export function isAppLang(value: unknown): value is AppLang {
    return typeof value === 'string' && (SUPPORTED_LANGS as string[]).includes(value);
}

export function readStoredLang(): AppLang {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isAppLang(stored)) {
            return stored;
        }
    } catch {
        // storage is unavailable (private mode, SSR) — fall through to the default
    }
    return DEFAULT_LANG;
}

/** Applies the language to both layers: app strings (@gravity-ui/i18n) and uikit component texts. */
export function applyLang(lang: AppLang) {
    i18nInstance.setLang(lang);
    configure({lang});
    document.documentElement.lang = lang;
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // ignore storage errors
    }
}
