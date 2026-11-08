import { addComponentKeysets } from '@gravity-ui/uikit/i18n';
import { configure, Lang } from '@gravity-ui/uikit';

export type AppLang = 'en' | 'ru';

const STORAGE_KEY = 'app-lang';

export function getInitialLang(): AppLang {
  if (typeof window === 'undefined') {
    return Lang.En;
  }
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === Lang.Ru ? Lang.Ru : Lang.En;
}

export function setAppLang(lang: AppLang) {
  configure({ lang });
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, lang);
  }
}

configure({ lang: getInitialLang() });

export const appI18n = addComponentKeysets(
  {
    en: {
      title: 'Gravity UI demo',
      subtitle: 'Switch the interface language using the control below.',
      language_label: 'Interface language',
      english: 'English',
      russian: 'Russian',
      card_title: 'Localization',
      card_body: 'All text on this page changes when you switch between English and Russian.',
      action_button: 'Click me',
      builtin_label: 'UIKit built-in components follow the selected language too:',
    },
    ru: {
      title: 'Демо Gravity UI',
      subtitle: 'Переключите язык интерфейса с помощью переключателя ниже.',
      language_label: 'Язык интерфейса',
      english: 'Английский',
      russian: 'Русский',
      card_title: 'Локализация',
      card_body: 'Весь текст на этой странице меняется при переключении между английским и русским.',
      action_button: 'Нажми меня',
      builtin_label: 'Встроенные компоненты UIKit также следуют выбранному языку:',
    },
  },
  'App',
);
