import {createContext, useContext, useLayoutEffect, useState, type ReactNode} from 'react';
import {configure} from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';
export const LANGUAGE_STORAGE_KEY = 'interface-language';

const en = {
  home: 'Forma home',
  personalWorkspace: 'Personal workspace',
  selectLanguage: 'Interface language',
  searchLanguage: 'Search languages',
  preferences: 'YOUR PREFERENCES',
  heading: 'Make yourself at home.',
  description: 'A familiar language makes everything feel a little easier.',
  interfaceLanguage: 'Interface language',
  languageDescription: 'Choose how you’d like to experience Forma.',
  english: 'English',
  russian: 'Russian',
  instantNote: 'Your language changes instantly, across the entire interface.',
  preview: 'A little preview',
  previewHint: 'See how it feels',
  yourWorkspace: 'YOUR WORKSPACE',
  welcome: 'Everything in its place.',
  welcomeDescription: 'A little more clarity. A little more room for what matters.',
  dateFormat: 'Date format',
  numberFormat: 'Number format',
  upToDate: 'You’re all up to date',
  saved: 'Preference saved on this device',
  applied: 'Language applied for this session',
  autoSave: 'Applied automatically',
  browserNote: 'Your language preference is personal to this browser.',
  sessionNote: 'Browser storage is unavailable. Your choice applies until you reload.',
  yourSpace: 'Your space. Your way.',
  pageTitle: 'Language preferences · Forma',
};

type Messages = Record<keyof typeof en, string>;

const ru: Messages = {
  home: 'Главная Forma',
  personalWorkspace: 'Личное пространство',
  selectLanguage: 'Язык интерфейса',
  searchLanguage: 'Поиск языка',
  preferences: 'ВАШИ НАСТРОЙКИ',
  heading: 'Чувствуйте себя как дома.',
  description: 'На знакомом языке всё становится немного проще.',
  interfaceLanguage: 'Язык интерфейса',
  languageDescription: 'Выберите, на каком языке пользоваться Forma.',
  english: 'Английский',
  russian: 'Русский',
  instantNote: 'Язык сразу изменится во всём интерфейсе.',
  preview: 'Предварительный просмотр',
  previewHint: 'Посмотрите, как это выглядит',
  yourWorkspace: 'ВАШЕ ПРОСТРАНСТВО',
  welcome: 'Всё на своих местах.',
  welcomeDescription: 'Больше ясности. Больше места для того, что важно.',
  dateFormat: 'Формат даты',
  numberFormat: 'Формат чисел',
  upToDate: 'Всё обновлено',
  saved: 'Настройка сохранена на этом устройстве',
  applied: 'Язык изменён на время сеанса',
  autoSave: 'Применяется автоматически',
  browserNote: 'Выбор языка сохраняется только в этом браузере.',
  sessionNote: 'Хранилище браузера недоступно. Выбор действует до перезагрузки.',
  yourSpace: 'Ваше пространство. Ваши правила.',
  pageTitle: 'Настройки языка · Forma',
};

const messages: Record<Language, Messages> = {en, ru};

function readLanguage(): Language {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) === 'ru' ? 'ru' : 'en';
  } catch {
    return 'en';
  }
}

const LocaleContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Messages;
  saved: boolean;
} | null>(null);

export function LocaleProvider({children}: {children: ReactNode}) {
  const [language, setLanguage] = useState<Language>(readLanguage);
  const [saved, setSaved] = useState(false);

  useLayoutEffect(() => {
    // Gravity UI subscribes to configure(), including controls rendered in portals.
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

  return <LocaleContext.Provider value={{language, setLanguage, t: messages[language], saved}}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error('useLocale must be used inside LocaleProvider');
  return context;
}
