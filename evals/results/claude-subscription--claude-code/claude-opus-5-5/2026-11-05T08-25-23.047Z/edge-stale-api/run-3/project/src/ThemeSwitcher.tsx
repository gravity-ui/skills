import { Switch, useThemeType } from '@gravity-ui/uikit';

import type { AppTheme } from './themeStorage';

export interface ThemeSwitcherProps {
  onThemeChange: (theme: AppTheme) => void;
}

export function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  // Текущий тип темы берём из контекста ThemeProvider
  const isDark = useThemeType() === 'dark';

  return (
    <Switch
      size="l"
      checked={isDark}
      onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      content="Тёмная тема"
    />
  );
}
