import React from 'react';

import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';

const STORAGE_KEY = 'app-language';

const messages = {
  en: {
    appTitle: 'Profile settings',
    appSubtitle: 'Demo of switching the interface language between English and Russian.',
    greeting: 'Hello, {name}!',
    defaultName: 'Friend',
    language: 'Interface language',
    name: 'Name',
    namePlaceholder: 'Enter your name',
    about: 'About',
    aboutPlaceholder: 'A few words about yourself',
    notifications: 'Email notifications',
    save: 'Save',
    cancel: 'Cancel',
    saved: 'Changes saved',
    accountInfo: 'Account information',
    email: 'Email',
    role: 'Role',
    roleAdmin: 'Administrator',
    plan: 'Plan',
    planFree: 'Free',
    status: 'Status',
    statusActive: 'Active',
  },
  ru: {
    appTitle: 'Настройки профиля',
    appSubtitle: 'Демонстрация переключения языка интерфейса между английским и русским.',
    greeting: 'Привет, {name}!',
    defaultName: 'Друг',
    language: 'Язык интерфейса',
    name: 'Имя',
    namePlaceholder: 'Введите ваше имя',
    about: 'О себе',
    aboutPlaceholder: 'Пара слов о себе',
    notifications: 'Уведомления по email',
    save: 'Сохранить',
    cancel: 'Отмена',
    saved: 'Изменения сохранены',
    accountInfo: 'Информация об аккаунте',
    email: 'Эл. почта',
    role: 'Роль',
    roleAdmin: 'Администратор',
    plan: 'Тариф',
    planFree: 'Бесплатный',
    status: 'Статус',
    statusActive: 'Активен',
  },
} as const;

export type MessageKey = keyof typeof messages.en;

export type TFunction = (key: MessageKey, params?: Record<string, string>) => string;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TFunction;
}

const LanguageContext = React.createContext<LanguageContextValue | null>(null);

function detectInitialLanguage(): Language {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'ru') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable; fall through to navigator detection
  }
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('ru')) {
    return 'ru';
  }
  return 'en';
}

export function LanguageProvider({children}: {children: React.ReactNode}) {
  const [language, setLanguageState] = React.useState<Language>(detectInitialLanguage);

  const setLanguage = React.useCallback((next: Language) => {
    setLanguageState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore persistence failures
    }
  }, []);

  React.useEffect(() => {
    // Localize Gravity UI's own component strings (placeholders, aria-labels, etc.)
    configure({lang: language});
    document.documentElement.lang = language;
  }, [language]);

  const t = React.useCallback<TFunction>(
    (key, params) => {
      let text: string = messages[language][key];
      if (params) {
        for (const [name, value] of Object.entries(params)) {
          text = text.replaceAll(`{${name}}`, value);
        }
      }
      return text;
    },
    [language],
  );

  const value = React.useMemo(
    () => ({language, setLanguage, t}),
    [language, setLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = React.useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within <LanguageProvider>');
  }
  return ctx;
}
