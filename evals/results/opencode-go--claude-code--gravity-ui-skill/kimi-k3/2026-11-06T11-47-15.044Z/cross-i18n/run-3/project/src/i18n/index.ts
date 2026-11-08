import {I18N} from '@gravity-ui/i18n';

import {en} from './keysets/en';
import {ru} from './keysets/ru';

export type AppLang = 'en' | 'ru';

export const i18n = new I18N({
    lang: 'en',
    fallbackLang: 'en',
    data: {en, ru},
});

export function setAppLang(lang: AppLang) {
    i18n.setLang(lang);
}

/**
 * Bound to the shared instance: reads the current language at call time,
 * so a React re-render after `setAppLang` picks up the new strings.
 */
export const t = i18n.keyset('app');
