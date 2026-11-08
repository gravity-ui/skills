import {I18N} from '@gravity-ui/i18n';
import {Lang} from '@gravity-ui/uikit';

import {en} from './keysets/en';
import {ru} from './keysets/ru';

export type AppLang = `${Lang}`;

export const DEFAULT_LANG: AppLang = Lang.En;
export const FALLBACK_LANG: AppLang = Lang.En;

export const SUPPORTED_LANGS: AppLang[] = [Lang.En, Lang.Ru];

/** Human-readable language names shown in the switcher, in their own language. */
export const LANG_LABELS: Record<AppLang, string> = {
  en: 'English',
  ru: 'Русский',
};

export const LANG_STORAGE_KEY = 'app-lang';

export const i18n = new I18N({
  lang: DEFAULT_LANG,
  fallbackLang: FALLBACK_LANG,
  data: {en, ru},
});

export type AppKey = keyof typeof en.app;

export const isAppLang = (value: unknown): value is AppLang =>
  typeof value === 'string' && (SUPPORTED_LANGS as string[]).includes(value);

/** Stored preference first, then the browser language, then the default. */
export function detectInitialLang(): AppLang {
  if (typeof window === 'undefined') {
    return DEFAULT_LANG;
  }
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isAppLang(stored)) {
      return stored;
    }
  } catch {
    // Storage may be unavailable (privacy mode); fall through to browser language.
  }
  const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
  return isAppLang(browserLang) ? browserLang : DEFAULT_LANG;
}

export function persistLang(lang: AppLang) {
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  } catch {
    // Ignore storage errors; the choice still applies for this session.
  }
}
