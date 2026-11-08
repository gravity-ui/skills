import { I18N } from '@gravity-ui/i18n';
import { configure } from '@gravity-ui/uikit';

import { messages, type Messages } from './messages';

export type AppLang = 'en' | 'ru';
export const APP_LANGS: readonly AppLang[] = ['en', 'ru'];

const STORAGE_KEY = 'app-lang';
const DEFAULT_LANG: AppLang = 'en';

function isAppLang(value: unknown): value is AppLang {
  return typeof value === 'string' && (APP_LANGS as readonly string[]).includes(value);
}

function readSavedLang(): AppLang {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return isAppLang(saved) ? saved : DEFAULT_LANG;
  } catch {
    // Storage can be unavailable (privacy mode, sandboxed iframe).
    return DEFAULT_LANG;
  }
}

export const initialLang: AppLang = readSavedLang();

// Keysets for app strings. Built-in uikit components use uikit's own keysets,
// which `configure({lang})` switches as well.
const i18n = new I18N({ lang: initialLang, fallbackLang: DEFAULT_LANG });
i18n.registerKeysets('en', messages.en);
i18n.registerKeysets('ru', messages.ru);

configure({ lang: initialLang, fallbackLang: DEFAULT_LANG });
document.documentElement.lang = initialLang;

export type AppKey = keyof Messages['app'];
export const t = i18n.keyset<AppKey>('app');

/** Switches the language for app strings, uikit components and `<html lang>`. */
export function setAppLang(lang: AppLang): void {
  i18n.setLang(lang);
  configure({ lang });
  document.documentElement.lang = lang;
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not persisted; the switch still applies for this session.
  }
}
