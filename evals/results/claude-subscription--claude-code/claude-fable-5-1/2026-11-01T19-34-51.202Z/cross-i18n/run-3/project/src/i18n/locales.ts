export const LANGS = ['en', 'ru'] as const;
export type Lang = (typeof LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';
export const LANG_STORAGE_KEY = 'app.lang';

const en = {
  'app.title': 'Team dashboard',
  'app.subtitle': 'A small demo app with a switchable interface language.',
  'language.label': 'Interface language',
  'language.en': 'English',
  'language.ru': 'Русский',
  'language.current': 'Current language: {lang}',
  'greeting.title': 'Welcome back!',
  'greeting.body':
    'All texts on this page, including built-in Gravity UI component labels, follow the selected language.',
  'counter.label': 'Button clicked {count} times',
  'counter.increment': 'Click me',
  'counter.reset': 'Reset',
  'table.title': 'Team members',
  'table.name': 'Name',
  'table.role': 'Role',
  'table.status': 'Status',
  'status.active': 'Active',
  'status.vacation': 'On vacation',
  'status.offline': 'Offline',
  'role.engineer': 'Engineer',
  'role.designer': 'Designer',
  'role.manager': 'Manager',
  'pagination.title': 'Built-in component strings',
  'pagination.hint':
    'Pagination below is rendered by Gravity UI. Its "First / Previous / Next" and page size labels are translated by the library itself.',
  'select.label': 'Favourite fruit',
  'select.placeholder': 'Choose a fruit',
  'select.filterPlaceholder': 'Search',
  'select.empty': 'Nothing found',
  'fruit.apple': 'Apple',
  'fruit.pear': 'Pear',
  'fruit.cherry': 'Cherry',
  'fruit.plum': 'Plum',
  'fruit.grape': 'Grape',
  'footer.saved': 'Your language choice is saved in this browser.',
};

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

const ru: Messages = {
  'app.title': 'Панель команды',
  'app.subtitle': 'Небольшое демо-приложение с переключаемым языком интерфейса.',
  'language.label': 'Язык интерфейса',
  'language.en': 'English',
  'language.ru': 'Русский',
  'language.current': 'Текущий язык: {lang}',
  'greeting.title': 'С возвращением!',
  'greeting.body':
    'Все тексты на этой странице, включая встроенные подписи компонентов Gravity UI, следуют выбранному языку.',
  'counter.label': 'Кнопка нажата {count} раз',
  'counter.increment': 'Нажми меня',
  'counter.reset': 'Сбросить',
  'table.title': 'Участники команды',
  'table.name': 'Имя',
  'table.role': 'Роль',
  'table.status': 'Статус',
  'status.active': 'Активен',
  'status.vacation': 'В отпуске',
  'status.offline': 'Не в сети',
  'role.engineer': 'Инженер',
  'role.designer': 'Дизайнер',
  'role.manager': 'Менеджер',
  'pagination.title': 'Встроенные строки компонентов',
  'pagination.hint':
    'Пагинация ниже отрисована Gravity UI. Подписи «Первая / Предыдущая / Следующая» и выбор размера страницы переводит сама библиотека.',
  'select.label': 'Любимый фрукт',
  'select.placeholder': 'Выберите фрукт',
  'select.filterPlaceholder': 'Поиск',
  'select.empty': 'Ничего не найдено',
  'fruit.apple': 'Яблоко',
  'fruit.pear': 'Груша',
  'fruit.cherry': 'Вишня',
  'fruit.plum': 'Слива',
  'fruit.grape': 'Виноград',
  'footer.saved': 'Выбор языка сохраняется в этом браузере.',
};

export const messages: Record<Lang, Messages> = { en, ru };

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

/**
 * Picks the language to start with: a previously saved choice wins,
 * otherwise the first browser language we support, otherwise the default.
 */
export function resolveInitialLang(
  stored: string | null | undefined,
  browserLangs: readonly string[] = [],
): Lang {
  if (isLang(stored)) return stored;
  for (const tag of browserLangs) {
    const base = tag.toLowerCase().split('-')[0];
    if (isLang(base)) return base;
  }
  return DEFAULT_LANG;
}

export type TranslateParams = Record<string, string | number>;

/** Substitutes `{name}` placeholders; unknown placeholders are left as-is. */
export function formatMessage(template: string, params?: TranslateParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  );
}

export function translate(lang: Lang, key: MessageKey, params?: TranslateParams): string {
  const template = messages[lang][key] ?? messages[DEFAULT_LANG][key] ?? key;
  return formatMessage(template, params);
}
