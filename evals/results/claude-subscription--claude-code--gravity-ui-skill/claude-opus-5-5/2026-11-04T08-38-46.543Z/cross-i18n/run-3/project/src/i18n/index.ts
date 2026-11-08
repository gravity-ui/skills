import * as React from 'react';
import { I18N } from '@gravity-ui/i18n';
import { Lang, configure, getConfig, useLang } from '@gravity-ui/uikit';

import en from './keysets/en.json';
import ru from './keysets/ru.json';

export const SUPPORTED_LANGS = [Lang.En, Lang.Ru] as const;
export type AppLang = (typeof SUPPORTED_LANGS)[number];

const STORAGE_KEY = 'app-lang';
const FALLBACK_LANG: AppLang = Lang.En;

// Every language must define the same keys as English (plural forms may differ).
type KeysetShape = { [K in keyof typeof en]: Record<keyof (typeof en)[K], unknown> };
const ruChecked: KeysetShape = ru;

const i18n = new I18N({
  lang: FALLBACK_LANG,
  fallbackLang: FALLBACK_LANG,
  data: { en, ru: ruChecked as typeof ru },
});

function isAppLang(value: unknown): value is AppLang {
  return SUPPORTED_LANGS.includes(value as AppLang);
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
  const browserLang = window.navigator.language?.slice(0, 2).toLowerCase();
  return isAppLang(browserLang) ? browserLang : undefined;
}

/**
 * Switches the language for both the app strings (@gravity-ui/i18n)
 * and the built-in texts of @gravity-ui/uikit components.
 */
export function setLanguage(lang: AppLang) {
  // App keysets first: configure() synchronously notifies subscribers (useLang),
  // so the instance must already be on the new language when they re-render.
  i18n.setLang(lang);
  configure({ lang, fallbackLang: FALLBACK_LANG });
  document.documentElement.lang = lang;

  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Storage may be unavailable (private mode, quotas) — the switch still works for the session.
  }
}

export function initLanguage() {
  setLanguage(readStoredLang() ?? detectBrowserLang() ?? FALLBACK_LANG);
}

export function getLanguage(): AppLang {
  const { lang } = getConfig();
  return isAppLang(lang) ? lang : FALLBACK_LANG;
}

type Keyset = keyof typeof en;

/**
 * Returns a translate function for the keyset. Subscribes to the uikit language
 * config, so the component re-renders when the language changes.
 */
export function useTranslation<K extends Keyset>(keyset: K) {
  const { lang } = useLang();
  const t = React.useMemo(
    () => i18n.keyset<Extract<keyof (typeof en)[K], string>>(keyset),
    // `lang` is a dependency so consumers memoized on `t` also refresh.
    [keyset, lang],
  );

  return { t, lang: isAppLang(lang) ? lang : FALLBACK_LANG };
}
