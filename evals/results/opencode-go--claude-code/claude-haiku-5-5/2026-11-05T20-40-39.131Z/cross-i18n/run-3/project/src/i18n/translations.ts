export const LANGUAGES = ['en', 'ru'] as const;

export type Language = (typeof LANGUAGES)[number];

/** Language names are shown in their own language, so they are not translated. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};

const en = {
  'app.title': 'Profile settings',
  'app.description': 'This page demonstrates switching the interface language.',
  'language.label': 'Interface language',

  'form.name': 'Name',
  'form.namePlaceholder': 'Enter your name',
  'form.nameRequired': 'Please enter your name',
  'form.email': 'Email',
  'form.emailNote': 'We will never share your email.',
  'form.newsletter': 'Subscribe to the newsletter',
  'form.cancel': 'Cancel',
  'form.save': 'Save',
  'form.saved': 'Changes saved',

  'pagination.title': 'Projects',
  'pagination.description': 'Built-in Gravity UI components are localized as well.',
};

export type TranslationKey = keyof typeof en;

const ru: Record<TranslationKey, string> = {
  'app.title': 'Настройки профиля',
  'app.description': 'Эта страница демонстрирует переключение языка интерфейса.',
  'language.label': 'Язык интерфейса',

  'form.name': 'Имя',
  'form.namePlaceholder': 'Введите имя',
  'form.nameRequired': 'Пожалуйста, введите имя',
  'form.email': 'Эл. почта',
  'form.emailNote': 'Мы никогда не передадим ваш адрес третьим лицам.',
  'form.newsletter': 'Подписаться на рассылку',
  'form.cancel': 'Отмена',
  'form.save': 'Сохранить',
  'form.saved': 'Изменения сохранены',

  'pagination.title': 'Проекты',
  'pagination.description': 'Встроенные компоненты Gravity UI также переведены.',
};

export const translations: Record<Language, Record<TranslationKey, string>> = { en, ru };
