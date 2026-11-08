import { createContext, useContext } from 'react';
import type { Theme } from '@gravity-ui/uikit';

export interface ThemeSwitcherState {
  theme: Theme;
  toggleTheme: () => void;
}

export const ThemeSwitcherContext = createContext<ThemeSwitcherState>({
  theme: 'light',
  toggleTheme: () => {},
});

export function useThemeSwitcher(): ThemeSwitcherState {
  return useContext(ThemeSwitcherContext);
}
