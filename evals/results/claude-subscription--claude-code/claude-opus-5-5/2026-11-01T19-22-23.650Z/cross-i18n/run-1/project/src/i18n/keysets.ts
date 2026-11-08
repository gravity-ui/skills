import { addComponentKeysets } from '@gravity-ui/uikit/i18n';

const en = {
  title: 'Interface language',
  description:
    'Choose the language of the interface. Your choice is saved and applied on the next visit.',
  'label_language': 'Language',
  'lang_en': 'English',
  'lang_ru': 'Русский',
  'current-language': 'Current language: {{name}}',
  'section_demo': 'Gravity UI components follow the selected language too',
  'label_search': 'Search',
  'placeholder_search': 'Type something…',
  'label_copy': 'Copy this text',
};

const ru: Record<keyof typeof en, string> = {
  title: 'Язык интерфейса',
  description:
    'Выберите язык интерфейса. Выбор сохраняется и будет применён при следующем посещении.',
  'label_language': 'Язык',
  'lang_en': 'English',
  'lang_ru': 'Русский',
  'current-language': 'Текущий язык: {{name}}',
  'section_demo': 'Компоненты Gravity UI тоже переключаются на выбранный язык',
  'label_search': 'Поиск',
  'placeholder_search': 'Введите что-нибудь…',
  'label_copy': 'Скопировать этот текст',
};

/**
 * Translations for the application. Registered in the same i18n instance as
 * Gravity UI's own keysets, so `useTranslation()` reacts to `ThemeProvider`'s `lang`.
 */
export const i18n = addComponentKeysets({ en, ru }, 'App');
