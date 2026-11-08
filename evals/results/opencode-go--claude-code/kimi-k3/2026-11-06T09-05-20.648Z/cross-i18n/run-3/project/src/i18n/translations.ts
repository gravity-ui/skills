export type Language = 'en' | 'ru';

export const LANGUAGES: Language[] = ['en', 'ru'];

export const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English',
  ru: 'Русский',
};

/**
 * UI strings for every supported language. Both dictionaries must expose
 * exactly the same keys — `translations.test.ts` guards that invariant.
 * Placeholders look like `{name}` and are filled in by `formatMessage`.
 */
export const translations = {
  en: {
    appTitle: 'Team Dashboard',
    appSubtitle: 'Track your team progress at a glance',
    languageSwitcherLabel: 'Interface language',
    greeting: 'Hello, {name}!',
    welcomeBack: 'Welcome back. Here is what is happening today.',
    statsActiveProjects: 'Active projects',
    statsOpenTasks: 'Open tasks',
    statsDoneThisWeek: 'Completed this week',
    progressTitle: 'Sprint progress',
    progressValue: '{done} of {total} tasks completed',
    notificationsTitle: 'Notifications',
    notificationsEmpty: 'You have no new notifications.',
    notificationReview: '{name} asked you to review a pull request',
    notificationDeploy: 'Deploy to production finished successfully',
    markAllRead: 'Mark all as read',
    createTask: 'Create task',
    footerNote: 'Built with Gravity UI',
  },
  ru: {
    appTitle: 'Панель команды',
    appSubtitle: 'Следите за прогрессом команды',
    languageSwitcherLabel: 'Язык интерфейса',
    greeting: 'Привет, {name}!',
    welcomeBack: 'С возвращением. Вот что происходит сегодня.',
    statsActiveProjects: 'Активные проекты',
    statsOpenTasks: 'Открытые задачи',
    statsDoneThisWeek: 'Выполнено за неделю',
    progressTitle: 'Прогресс спринта',
    progressValue: 'Выполнено {done} из {total} задач',
    notificationsTitle: 'Уведомления',
    notificationsEmpty: 'У вас нет новых уведомлений.',
    notificationReview: '{name} просит вас посмотреть pull request',
    notificationDeploy: 'Деплой в production успешно завершён',
    markAllRead: 'Отметить все прочитанными',
    createTask: 'Создать задачу',
    footerNote: 'Сделано на Gravity UI',
  },
} as const;

export type TranslationKey = keyof (typeof translations)['en'];

/**
 * Look up `key` in `language` and substitute `{placeholder}` params.
 * Pure function so it can be unit-tested without rendering React.
 */
export function formatMessage(
  language: Language,
  key: TranslationKey,
  params?: Record<string, string | number>,
): string {
  let text: string = translations[language][key] ?? key;
  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replaceAll(`{${paramKey}}`, String(value));
    }
  }
  return text;
}
