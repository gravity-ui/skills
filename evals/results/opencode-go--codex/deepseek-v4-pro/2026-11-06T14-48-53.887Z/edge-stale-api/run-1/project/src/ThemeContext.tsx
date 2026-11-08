import { createContext, useContext } from 'react';
import type { Theme } from '@gravity-ui/uikit';

export interface AppThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const AppThemeContext = createContext<AppThemeContextType>({
  theme: 'system',
  setTheme: () => {},
});

export const useAppTheme = () => useContext(AppThemeContext);
