import { createContext, useContext } from 'react';
import type { Theme } from '@gravity-ui/uikit';

export interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
});

export function useThemeContext() {
  return useContext(ThemeContext);
}
