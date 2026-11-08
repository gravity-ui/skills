export const LANGUAGES = ['en', 'ru'] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

const en = {
  'app.title': 'Language switcher demo',
  'app.description':
    'Pick a language below. Both the application texts and the built-in Gravity UI strings switch instantly.',
  'language.label': 'Interface language',
  'language.en': 'English',
  'language.ru': 'Russian',
  'language.current': 'Current language: {language}',
  'greeting.title': 'Hello!',
  'greeting.text': 'Your choice is saved in the browser and restored on the next visit.',
  'form.name.label': 'Name',
  'form.name.placeholder': 'Enter your name',
  'form.fruit.label': 'Favourite fruit',
  'form.fruit.placeholder': 'Choose a fruit',
  'form.fruit.apple': 'Apple',
  'form.fruit.banana': 'Banana',
  'form.fruit.cherry': 'Cherry',
  'form.submit': 'Save',
  'form.reset': 'Reset',
  'toast.saved': 'Settings saved',
  'pagination.caption': 'Built-in Gravity UI strings (pagination) are also localised:',
} as const;

export type TranslationKey = keyof typeof en;

export type Dictionary = Record<TranslationKey, string>;

const ru: Dictionary = {
  'app.title': 'Демонстрация переключения языка',
  'app.description':
    'Выберите язык ниже. Тексты приложения и встроенные строки Gravity UI переключаются мгновенно.',
  'language.label': 'Язык интерфейса',
  'language.en': 'Английский',
  'language.ru': 'Русский',
  'language.current': 'Текущий язык: {language}',
  'greeting.title': 'Привет!',
  'greeting.text': 'Ваш выбор сохраняется в браузере и восстанавливается при следующем визите.',
  'form.name.label': 'Имя',
  'form.name.placeholder': 'Введите имя',
  'form.fruit.label': 'Любимый фрукт',
  'form.fruit.placeholder': 'Выберите фрукт',
  'form.fruit.apple': 'Яблоко',
  'form.fruit.banana': 'Банан',
  'form.fruit.cherry': 'Вишня',
  'form.submit': 'Сохранить',
  'form.reset': 'Сбросить',
  'toast.saved': 'Настройки сохранены',
  'pagination.caption': 'Встроенные строки Gravity UI (пагинация) тоже локализованы:',
};

export const translations: Record<Language, Dictionary> = { en, ru };

export type TranslationParams = Record<string, string | number>;

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}

/**
 * Resolve a translation key for the given language, falling back to the default
 * language and finally to the key itself. `{param}` placeholders are replaced
 * from `params`.
 */
export function translate(
  language: Language,
  key: TranslationKey,
  params?: TranslationParams,
): string {
  const template =
    translations[language]?.[key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;

  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}
