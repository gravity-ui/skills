export const SUPPORTED_LANGUAGES = ['en', 'ru'] as const;

export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = 'en';

/** Названия языков всегда показываем на самом языке, чтобы их можно было узнать из любой локали. */
export const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English',
    ru: 'Русский',
};

const en = {
    'app.title': 'Demo application',
    'app.subtitle': 'The interface language can be switched at any time — your choice is remembered.',
    'language.label': 'Interface language',
    'form.title': 'Feedback',
    'form.nameLabel': 'Name',
    'form.namePlaceholder': 'Enter your name',
    'form.submit': 'Send',
    'form.greeting': 'Hello, {name}!',
    'form.greetingAnonymous': 'Hello! Tell us your name.',
    'pagination.title': 'Built-in Gravity UI components are translated too',
    'pagination.currentPage': 'Current page: {page}',
} as const;

export type TranslationKey = keyof typeof en;

const ru: Record<TranslationKey, string> = {
    'app.title': 'Демо-приложение',
    'app.subtitle': 'Язык интерфейса можно сменить в любой момент — выбор сохраняется.',
    'language.label': 'Язык интерфейса',
    'form.title': 'Обратная связь',
    'form.nameLabel': 'Имя',
    'form.namePlaceholder': 'Введите ваше имя',
    'form.submit': 'Отправить',
    'form.greeting': 'Здравствуйте, {name}!',
    'form.greetingAnonymous': 'Здравствуйте! Представьтесь, пожалуйста.',
    'pagination.title': 'Встроенные компоненты Gravity UI тоже переводятся',
    'pagination.currentPage': 'Текущая страница: {page}',
};

export const translations: Record<Language, Record<TranslationKey, string>> = {en, ru};

export function isLanguage(value: unknown): value is Language {
    return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}
