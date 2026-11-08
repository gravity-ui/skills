export const en = {
  'app.title': 'Localized application',
  'app.subtitle': 'Switch the interface language using the control in the header.',
  'lang.label': 'Language',
  'lang.en': 'English',
  'lang.ru': 'Русский',
  'lang.current': 'Current language: {lang}',
  'card.about.title': 'About this demo',
  'card.about.body':
    'All texts on this page come from a dictionary. Built-in Gravity UI texts (for example, pagination buttons) are also switched through the library configuration.',
  'card.form.title': 'Sample form',
  'card.form.name': 'Name',
  'card.form.name.placeholder': 'Enter your name',
  'card.form.notifications': 'Enable notifications',
  'card.form.submit': 'Save',
  'card.form.saved': 'Changes saved',
  'card.pagination.title': 'Built-in component texts',
  'card.pagination.hint': 'The texts below are rendered by Gravity UI itself.',
} as const;

export type TranslationKey = keyof typeof en;
export type Dictionary = Record<TranslationKey, string>;
