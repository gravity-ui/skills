import React from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

export type Language = 'en' | 'ru';

export const LANGUAGES: Language[] = ['en', 'ru'];

const STORAGE_KEY = 'app-language';

const messages = {
  en: {
    title: 'Language switching',
    description: 'The interface language can be switched between English and Russian.',
    languageLabel: 'Interface language',
    english: 'English',
    russian: 'Русский',
    selectLabel: 'Fruit',
    selectPlaceholder: 'Choose a fruit',
    apple: 'Apple',
    banana: 'Banana',
    cherry: 'Cherry',
    paginationHint: 'Built-in Gravity UI components are translated too:',
  },
  ru: {
    title: 'Переключение языка',
    description: 'Язык интерфейса можно переключать между английским и русским.',
    languageLabel: 'Язык интерфейса',
    english: 'English',
    russian: 'Русский',
    selectLabel: 'Фрукт',
    selectPlaceholder: 'Выберите фрукт',
    apple: 'Яблоко',
    banana: 'Банан',
    cherry: 'Вишня',
    paginationHint: 'Встроенные компоненты Gravity UI тоже переведены:',
  },
} as const;

export type MessageKey = keyof (typeof messages)['en'];

// Compile-time check that every language defines the same keys.
const _typecheck: Record<Language, Record<MessageKey, string>> = messages;
void _typecheck;

function detectInitialLanguage(): Language {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'ru') return saved;
  } catch {
    // localStorage may be unavailable (private mode, etc.)
  }
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: MessageKey) => string;
}

const I18nContext = React.createContext<I18nContextValue | null>(null);

/**
 * Owns the current language, keeps <html lang> and localStorage in sync, and
 * passes the language to Gravity UI's ThemeProvider so built-in component
 * strings (pagination, date pickers, etc.) are localized as well.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(detectInitialLanguage);

  React.useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const value = React.useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage: setLanguageState,
      t: (key) => messages[language][key],
    }),
    [language],
  );

  return (
    <I18nContext.Provider value={value}>
      <ThemeProvider theme="light" lang={language}>
        {children}
      </ThemeProvider>
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = React.useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
