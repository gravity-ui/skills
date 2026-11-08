import {I18N} from '@gravity-ui/i18n';
import {Lang, configure} from '@gravity-ui/uikit';

import {en, ru} from './keysets';

export type AppLang = Lang.En | Lang.Ru;
export const SUPPORTED_LANGS: AppLang[] = [Lang.En, Lang.Ru];

const STORAGE_KEY = 'app-lang';

function isAppLang(value: unknown): value is AppLang {
    return SUPPORTED_LANGS.includes(value as AppLang);
}

export function getInitialLang(): AppLang {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isAppLang(stored)) {
            return stored;
        }
    } catch {
        // localStorage may be unavailable (privacy mode) — fall through.
    }
    const browserLang = window.navigator.language?.slice(0, 2);
    return isAppLang(browserLang) ? browserLang : Lang.En;
}

export const i18n = new I18N({
    lang: Lang.En,
    fallbackLang: Lang.En,
    data: {en, ru},
});

/**
 * Applies the language everywhere outside React state:
 * app keysets, uikit's global config, <html lang> and persisted choice.
 */
export function applyLang(lang: AppLang) {
    i18n.setLang(lang);
    configure({lang});
    document.documentElement.lang = lang;
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // Ignore persistence errors.
    }
}

export type AppKeysets = typeof en;
