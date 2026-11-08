export type Language = 'en' | 'ru';

export const LANGUAGE_STORAGE_KEY = 'app.language';

export const translations = {
  en: {
    title: 'Language settings',
    settings: 'Settings',
    heading: 'Make yourself at home',
    description: 'Choose the language that feels right for you.',
    language: 'Interface language',
    languageDescription: 'Used for menus, buttons, and other interface text.',
    instant: 'Changes apply immediately.',
    saved: 'Your language preference is saved in this browser.',
    unsaved: 'Language changed. This browser could not save your preference.',
    preview: 'PREVIEW',
    welcome: 'Hello, welcome back!',
    previewDescription: 'A familiar language makes everything a little easier.',
    currentLanguage: 'Current language',
    languageName: 'English',
    footer: 'Your space. Your language.',
  },
  ru: {
    title: 'Настройки языка',
    settings: 'Настройки',
    heading: 'Чувствуйте себя как дома',
    description: 'Выберите язык, на котором вам удобно.',
    language: 'Язык интерфейса',
    languageDescription: 'Для меню, кнопок и других текстов интерфейса.',
    instant: 'Изменения применяются сразу.',
    saved: 'Выбранный язык сохранён в этом браузере.',
    unsaved: 'Язык изменён. Браузеру не удалось сохранить ваш выбор.',
    preview: 'ПРЕДПРОСМОТР',
    welcome: 'Здравствуйте, с возвращением!',
    previewDescription: 'На знакомом языке всё становится немного проще.',
    currentLanguage: 'Текущий язык',
    languageName: 'Русский',
    footer: 'Ваше пространство. Ваш язык.',
  },
} satisfies Record<Language, Record<string, string>>;

export function isLanguage(value: unknown): value is Language {
  return value === 'en' || value === 'ru';
}

export function getInitialLanguage(): Language {
  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isLanguage(saved)) return saved;
  } catch {
    // The interface still works when browser storage is unavailable.
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')
    ? 'ru'
    : 'en';
}

export function saveLanguage(language: Language): boolean {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    return true;
  } catch {
    return false;
  }
}
