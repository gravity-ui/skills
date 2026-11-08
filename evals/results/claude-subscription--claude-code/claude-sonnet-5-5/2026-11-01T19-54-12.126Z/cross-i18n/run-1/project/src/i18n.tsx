import React from 'react';

export type Lang = 'en' | 'ru';

export const LANGS: readonly Lang[] = ['en', 'ru'];

const STORAGE_KEY = 'app-lang';

const dictionaries = {
  en: {
    title: 'Welcome',
    description: 'This interface can be displayed in English or Russian.',
    language: 'Language',
    switchLanguage: 'Interface language',
    langEn: 'English',
    langRu: 'Русский',
    namePlaceholder: 'Your name',
    greeting: 'Hello, {name}!',
    greetingAnonymous: 'Hello, stranger!',
  },
  ru: {
    title: 'Добро пожаловать',
    description: 'Интерфейс можно отобразить на английском или русском языке.',
    language: 'Язык',
    switchLanguage: 'Язык интерфейса',
    langEn: 'English',
    langRu: 'Русский',
    namePlaceholder: 'Ваше имя',
    greeting: 'Привет, {name}!',
    greetingAnonymous: 'Привет, незнакомец!',
  },
} as const;

export type MessageKey = keyof (typeof dictionaries)['en'];

type Params = Record<string, string | number>;

function detectInitialLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // localStorage may be unavailable (private mode etc.)
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: MessageKey, params?: Params) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>(detectInitialLang);

  const setLang = React.useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore
    }
  }, []);

  React.useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = React.useMemo<I18nContextValue>(() => {
    const t = (key: MessageKey, params?: Params) => {
      const template: string = dictionaries[lang][key];
      if (!params) return template;
      return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        name in params ? String(params[name]) : match,
      );
    };
    return { lang, setLang, t };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
