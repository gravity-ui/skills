export type Language = 'en' | 'ru';

/** Language names are shown in their own language (endonyms), so they are not translated. */
export const LANGUAGES: readonly { code: Language; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export type PluralCategory = 'zero' | 'one' | 'two' | 'few' | 'many' | 'other';

/** A plain string, or plural forms selected via Intl.PluralRules by the `count` param. */
export type Message = string | ({ other: string } & Partial<Record<PluralCategory, string>>);

const en = {
  'app.title': 'Gravity UI eval',
  'app.languageSwitch': 'Interface language',
  'hero.title': 'Hello, world!',
  'hero.description': 'Use the switcher in the header to change the interface language.',
  'counter.title': 'Counter',
  'counter.clicks': {
    one: '{count} click',
    other: '{count} clicks',
  },
  'counter.increment': 'Increment',
  'counter.reset': 'Reset',
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;

const ru: Record<MessageKey, Message> = {
  'app.title': 'Gravity UI eval',
  'app.languageSwitch': 'Язык интерфейса',
  'hero.title': 'Привет, мир!',
  'hero.description': 'Используйте переключатель в шапке, чтобы изменить язык интерфейса.',
  'counter.title': 'Счётчик',
  'counter.clicks': {
    one: '{count} клик',
    few: '{count} клика',
    many: '{count} кликов',
    other: '{count} клика',
  },
  'counter.increment': 'Увеличить',
  'counter.reset': 'Сбросить',
};

export const translations: Record<Language, Record<MessageKey, Message>> = { en, ru };

export type TranslationParams = Record<string, string | number>;

/** Pure translation function: picks the plural form, then substitutes `{name}` placeholders. */
export function translate(
  language: Language,
  key: MessageKey,
  params?: TranslationParams,
): string {
  const message = translations[language][key];

  let template: string;
  if (typeof message === 'string') {
    template = message;
  } else {
    const count = params?.count;
    const category = typeof count === 'number' ? new Intl.PluralRules(language).select(count) : 'other';
    template = message[category as PluralCategory] ?? message.other;
  }

  return template.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    params && name in params ? String(params[name]) : placeholder,
  );
}
