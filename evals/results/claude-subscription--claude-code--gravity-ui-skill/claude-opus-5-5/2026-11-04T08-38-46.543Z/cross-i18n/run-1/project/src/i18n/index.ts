import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export const LANGS = ['en', 'ru'] as const;
export type AppLang = (typeof LANGS)[number];

const STORAGE_KEY = 'app-lang';
const FALLBACK_LANG: AppLang = 'en';

function isAppLang(value: unknown): value is AppLang {
    return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

function detectInitialLang(): AppLang {
    try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (isAppLang(stored)) {
            return stored;
        }
    } catch {
        // localStorage may be unavailable (privacy mode) — ignore.
    }
    const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
    return isAppLang(browserLang) ? browserLang : FALLBACK_LANG;
}

export const initialLang = detectInitialLang();

/** Translations for application strings. Built-in uikit strings are handled by `configure`. */
export const i18n = new I18N({
    lang: initialLang,
    fallbackLang: FALLBACK_LANG,
    data: {en, ru},
});

/** Applies the language everywhere: app keysets, uikit components, <html lang>, storage. */
export function applyLang(lang: AppLang) {
    i18n.setLang(lang);
    configure({lang, fallbackLang: FALLBACK_LANG});
    document.documentElement.lang = lang;
    try {
        window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // ignore
    }
}

// Configure before the first render so there is no flash of the wrong language.
applyLang(initialLang);

export type AppKey = keyof (typeof en)['app'];
export const appKeyset = i18n.keyset<AppKey>('app');
