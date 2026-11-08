import { createContext, useContext } from 'react';

export type ThemeSetting = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'app-theme';

export function loadTheme(): ThemeSetting {
  const saved = window.localStorage.getItem(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
}

export function saveTheme(theme: ThemeSetting) {
  window.localStorage.setItem(STORAGE_KEY, theme);
}

export const ThemeSettingContext = createContext<{
  theme: ThemeSetting;
  setTheme: (theme: ThemeSetting) => void;
}>({ theme: 'system', setTheme: () => {} });

export const useThemeSetting = () => useContext(ThemeSettingContext);
