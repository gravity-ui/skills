import { createContext, useContext } from 'react';

export type ThemeChoice = 'light' | 'dark' | 'system';

export const THEME_CHOICES: readonly ThemeChoice[] = ['light', 'dark', 'system'];

export const THEME_STORAGE_KEY = 'theme';

const DEFAULT_THEME: ThemeChoice = 'light';

function isThemeChoice(value: unknown): value is ThemeChoice {
  return typeof value === 'string' && (THEME_CHOICES as readonly string[]).includes(value);
}

/** Читает сохранённую тему. Если её нет, значение некорректно или localStorage недоступен — возвращает дефолт. */
export function loadThemeChoice(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeChoice(saved)) {
      return saved;
    }
  } catch {
    // localStorage может быть недоступен (запрет хранилища, приватный режим) — используем дефолт.
  }
  return DEFAULT_THEME;
}

export function saveThemeChoice(theme: ThemeChoice): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Не удалось сохранить — тема всё равно применится в текущей сессии.
  }
}

export interface ThemeChoiceContextValue {
  theme: ThemeChoice;
  setTheme: (theme: ThemeChoice) => void;
}

export const ThemeChoiceContext = createContext<ThemeChoiceContextValue | null>(null);

export function useThemeChoice(): ThemeChoiceContextValue {
  const value = useContext(ThemeChoiceContext);
  if (!value) {
    throw new Error('useThemeChoice must be used inside <ThemeRoot>');
  }
  return value;
}
