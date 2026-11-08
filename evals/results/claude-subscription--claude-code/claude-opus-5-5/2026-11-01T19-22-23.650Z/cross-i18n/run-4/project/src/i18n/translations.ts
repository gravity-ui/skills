export const LANGUAGES = ['en', 'ru'] as const;
export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

/** Plural forms keyed by `Intl.PluralRules` categories; `other` is mandatory. */
export type PluralMessage = Partial<Record<Intl.LDMLPluralRule, string>> & {other: string};
export type Message = string | PluralMessage;

const en = {
    'app.title': 'Language switcher demo',
    'app.description':
        'Switch the interface language — your choice is saved and restored on the next visit.',
    'language.label': 'Interface language',
    'language.en': 'English',
    'language.ru': 'Русский',
    'counter.title': 'Counter',
    'counter.value': {one: 'You clicked {count} time', other: 'You clicked {count} times'},
    'counter.increment': 'Click me',
    'counter.reset': 'Reset',
    'pagination.title': 'Built-in component texts',
    'pagination.hint': 'Gravity UI components are translated too:',
} satisfies Record<string, Message>;

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, Message>;

const ru: Messages = {
    'app.title': 'Демо переключения языка',
    'app.description':
        'Переключите язык интерфейса — выбор сохранится и восстановится при следующем визите.',
    'language.label': 'Язык интерфейса',
    'language.en': 'English',
    'language.ru': 'Русский',
    'counter.title': 'Счётчик',
    'counter.value': {
        one: 'Вы нажали {count} раз',
        few: 'Вы нажали {count} раза',
        many: 'Вы нажали {count} раз',
        other: 'Вы нажали {count} раза',
    },
    'counter.increment': 'Нажми меня',
    'counter.reset': 'Сбросить',
    'pagination.title': 'Тексты встроенных компонентов',
    'pagination.hint': 'Компоненты Gravity UI тоже переводятся:',
};

export const translations: Record<Language, Messages> = {en, ru};

export function isLanguage(value: unknown): value is Language {
    return typeof value === 'string' && (LANGUAGES as readonly string[]).includes(value);
}
