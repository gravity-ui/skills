// App UI strings. The keyset name ("app") is used by I18nProvider.
// Keep both languages in sync: every key in `en` must exist in `ru`.
export const en = {
  title: 'Welcome',
  subtitle: 'Use the switcher to change the interface language.',
  languageLabel: 'Interface language',
  description: 'Texts of this app and built-in Gravity UI components switch together.',
  save: 'Save',
  cancel: 'Cancel',
};

export const ru: Record<keyof typeof en, string> = {
  title: 'Добро пожаловать',
  subtitle: 'Используйте переключатель, чтобы сменить язык интерфейса.',
  languageLabel: 'Язык интерфейса',
  description: 'Тексты приложения и встроенных компонентов Gravity UI переключаются вместе.',
  save: 'Сохранить',
  cancel: 'Отмена',
};

export type AppKey = keyof typeof en;
