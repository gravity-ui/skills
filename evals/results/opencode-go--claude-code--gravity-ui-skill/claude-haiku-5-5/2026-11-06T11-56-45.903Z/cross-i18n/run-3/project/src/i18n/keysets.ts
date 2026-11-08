// Application strings. `ru` is typed against `en`, so a missing Russian key is a compile error.
export const en = {
  app_title: 'Gravity UI app',
  app_description:
    'Switch the interface language between English and Russian. Texts of Gravity UI components follow the selected language too.',
  language_switcher_label: 'Interface language',
  current_language: 'Current language: {{language}}',
  sample_title: 'Example component',
  sample_hint: 'Built-in controls such as pagination are localized by Gravity UI.',
};

export type AppKey = keyof typeof en;

export const ru: Record<AppKey, string> = {
  app_title: 'Приложение на Gravity UI',
  app_description:
    'Переключайте язык интерфейса между английским и русским. Тексты компонентов Gravity UI также следуют выбранному языку.',
  language_switcher_label: 'Язык интерфейса',
  current_language: 'Текущий язык: {{language}}',
  sample_title: 'Пример компонента',
  sample_hint: 'Встроенные элементы управления, например пагинация, также локализуются Gravity UI.',
};
