import {I18N} from '@gravity-ui/i18n';
import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';
const storageKey = 'app.language';

const en = {
  title: 'Settings',
  description: 'Customize your application interface.',
  language: 'Interface language',
  hint: 'Changes take effect immediately.',
};

const ru: Record<keyof typeof en, string> = {
  title: 'Настройки',
  description: 'Настройте интерфейс приложения.',
  language: 'Язык интерфейса',
  hint: 'Изменения применяются сразу.',
};

const i18n = new I18N();
i18n.registerKeysets('en', {app: en});
i18n.registerKeysets('ru', {app: ru});

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

function readLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(storageKey);
    if (isLanguage(saved)) return saved;
  } catch {
    // Language switching also works when browser storage is unavailable.
  }
  return 'en';
}

export function t(key: keyof typeof en): string {
  return i18n.i18n('app', key);
}

function applyLanguage(language: Language) {
  i18n.setLang(language);
  configure({lang: language});
  document.documentElement.lang = language;
  document.title = t('title');
}

export function setLanguage(language: Language) {
  applyLanguage(language);
  try {
    window.localStorage.setItem(storageKey, language);
  } catch {
    // Keep the selected language for this session even if persistence fails.
  }
}

// Configure both translation systems before the first React render.
export const initialLanguage = readLanguage();
applyLanguage(initialLanguage);
