// App-level strings go through Gravity's own i18n runtime (@gravity-ui/i18n):
// a single I18N instance with en/ru keysets registered up front; the current
// language is switched at runtime with setLang(). UIKit's built-in component
// texts are switched separately via configure({lang}) from @gravity-ui/uikit
// (see App.tsx) — together they cover 100% of the interface strings.
import { I18N } from '@gravity-ui/i18n';

export type AppLang = 'en' | 'ru';

export const DEFAULT_LANG: AppLang = 'en';

export const appI18n = new I18N({
  lang: DEFAULT_LANG,
  fallbackLang: DEFAULT_LANG,
  data: {
    en: {
      app: {
        title: 'Internationalization demo',
        description:
          'Switch the interface language between English and Russian — every text on this page follows.',
        language_label: 'Interface language',
        language_en: 'English',
        language_ru: 'Русский',
        greeting: 'Hello! These strings come from the app keysets (@gravity-ui/i18n).',
        uikit_hint:
          'The empty table below is rendered by Gravity UIKit itself — its "No data" text is localized by the library via configure({lang}).',
        column_name: 'Name',
        column_value: 'Value',
      },
    },
    ru: {
      app: {
        title: 'Демонстрация интернационализации',
        description:
          'Переключайте язык интерфейса между английским и русским — весь текст на странице меняется.',
        language_label: 'Язык интерфейса',
        language_en: 'English',
        language_ru: 'Русский',
        greeting: 'Привет! Эти строки берутся из кейсетов приложения (@gravity-ui/i18n).',
        uikit_hint:
          'Пустая таблица ниже отрисована самим Gravity UIKit — её текст «Нет данных» локализует сама библиотека через configure({lang}).',
        column_name: 'Название',
        column_value: 'Значение',
      },
    },
  },
});

// Bound translator for the "app" keyset: i18n('title') → string in the current language.
export const i18n = appI18n.keyset('app');
