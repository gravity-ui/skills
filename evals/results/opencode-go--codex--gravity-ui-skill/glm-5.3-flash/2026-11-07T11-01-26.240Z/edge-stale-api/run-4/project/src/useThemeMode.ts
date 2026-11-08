import { useEffect, useState } from 'react';

import { useThemeType } from '@gravity-ui/uikit';

import type { ThemeMode } from './themeMode';

const STORAGE_KEY = 'app-theme-mode';

function getInitialThemeMode(systemThemeType: ThemeMode): ThemeMode {
  if (typeof window === 'undefined') {
    return systemThemeType;
  }

  const savedThemeMode = window.localStorage.getItem(STORAGE_KEY);

  return savedThemeMode === 'dark' || savedThemeMode === 'light' ? savedThemeMode : systemThemeType;
}

export function useThemeMode() {
  const systemThemeType = useThemeType();
  const [themeMode, setThemeMode] = useState(() => getInitialThemeMode(systemThemeType));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, themeMode);
  }, [themeMode]);

  return [themeMode, setThemeMode] as const;
}
