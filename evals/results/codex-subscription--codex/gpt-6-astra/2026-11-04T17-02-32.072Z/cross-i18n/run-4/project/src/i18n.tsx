import {configure} from '@gravity-ui/uikit';
import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';

export type Language = 'en' | 'ru';
export const LANGUAGE_STORAGE_KEY = 'app.language';

const en = {
  appName: 'Workspace',
  settings: 'Settings',
  subtitle: 'Make yourself at home. Set up your workspace your way.',
  preferences: 'Preferences',
  language: 'Interface language',
  description: 'Choose the language you’d like to use in the app.',
  instant: 'The interface updates immediately when you select a language.',
  saved: 'Your preference is saved automatically in this browser.',
  sessionOnly: 'Your language is applied. This browser could not save your preference.',
  current: 'Current language',
  languageName: 'English',
  pageTitle: 'Language settings · Workspace',
};

type Messages = Record<keyof typeof en, string>;
const messages: Record<Language, Messages> = {
  en,
  ru: {
    appName: 'Рабочее пространство',
    settings: 'Настройки',
    subtitle: 'Устройтесь поудобнее. Настройте рабочее пространство под себя.',
    preferences: 'Предпочтения',
    language: 'Язык интерфейса',
    description: 'Выберите язык, на котором вам удобно работать в приложении.',
    instant: 'Интерфейс обновится сразу после выбора языка.',
    saved: 'Ваш выбор автоматически сохраняется в этом браузере.',
    sessionOnly: 'Язык применён. Браузеру не удалось сохранить ваш выбор.',
    current: 'Текущий язык',
    languageName: 'Русский',
    pageTitle: 'Настройки языка · Рабочее пространство',
  },
};

export function getInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // Language switching remains available when browser storage is disabled.
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('ru')
    ? 'ru'
    : 'en';
}

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Messages;
  saved: boolean;
} | null>(null);

export function LanguageProvider({children}: {children: ReactNode}) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    configure({lang: language});
    document.documentElement.lang = language;
    document.title = messages[language].pageTitle;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }, [language]);

  return (
    <LanguageContext.Provider value={{language, setLanguage, t: messages[language], saved}}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}
