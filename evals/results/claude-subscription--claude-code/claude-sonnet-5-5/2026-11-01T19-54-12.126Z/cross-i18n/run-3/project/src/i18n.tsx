import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type Locale = 'en' | 'ru';

export const LOCALES: Locale[] = ['en', 'ru'];

const STORAGE_KEY = 'app-locale';

const messages = {
  en: {
    title: 'Language settings',
    description: 'Choose the interface language. Your choice is saved in this browser.',
    language: 'Interface language',
    english: 'English',
    russian: 'Русский',
    currentLanguage: 'Current language: {language}',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    greeting: 'Hello, {name}!',
    greetingAnonymous: 'Hello, stranger!',
    save: 'Save',
    cancel: 'Cancel',
  },
  ru: {
    title: 'Настройки языка',
    description: 'Выберите язык интерфейса. Выбор сохраняется в этом браузере.',
    language: 'Язык интерфейса',
    english: 'English',
    russian: 'Русский',
    currentLanguage: 'Текущий язык: {language}',
    name: 'Имя',
    namePlaceholder: 'Введите ваше имя',
    greeting: 'Привет, {name}!',
    greetingAnonymous: 'Привет, незнакомец!',
    save: 'Сохранить',
    cancel: 'Отмена',
  },
} as const satisfies Record<Locale, Record<string, string>>;

export type MessageKey = keyof (typeof messages)['en'];

type TFunction = (key: MessageKey, params?: Record<string, string | number>) => string;

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as string[]).includes(value);
}

function detectInitialLocale(): Locale {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isLocale(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>(detectInitialLocale);

  const setLocale = React.useCallback((next: Locale) => {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence errors
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = React.useCallback<TFunction>(
    (key, params) => {
      const template: string = messages[locale][key] ?? messages.en[key];
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      );
    },
    [locale],
  );

  const value = React.useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {/* `lang` also switches the built-in strings of Gravity UI components */}
      <ThemeProvider theme="light" lang={locale}>
        {children}
      </ThemeProvider>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>');
  return ctx;
}
