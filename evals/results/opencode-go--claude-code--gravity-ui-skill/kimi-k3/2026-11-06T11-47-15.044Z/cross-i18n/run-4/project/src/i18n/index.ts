import {I18N} from '@gravity-ui/i18n';
import {Lang, configure} from '@gravity-ui/uikit';

import {en} from './keysets/en';
import {ru} from './keysets/ru';

export type AppLang = Lang;

const STORAGE_KEY = 'app-lang';

const i18nInstance = new I18N();
i18nInstance.registerKeysets(Lang.En, en);
i18nInstance.registerKeysets(Lang.Ru, ru);

/** Switches both uikit component texts and application strings. */
export function setLanguage(lang: AppLang) {
    configure({lang});
    i18nInstance.setLang(lang);
    document.documentElement.lang = lang;
    try {
        localStorage.setItem(STORAGE_KEY, lang);
    } catch {
        // localStorage may be unavailable; language still switches for the session
    }
}

function getInitialLang(): AppLang {
    try {
        if (localStorage.getItem(STORAGE_KEY) === Lang.Ru) {
            return Lang.Ru;
        }
    } catch {
        // ignore
    }
    return Lang.En;
}

setLanguage(getInitialLang());

/** Application strings bound to the `app` keyset. */
export const i18n = i18nInstance.i18n.bind(i18nInstance, 'app');
