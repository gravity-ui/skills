import { Switch, useThemeType } from '@gravity-ui/uikit';

import { useSetTheme } from './AppThemeProvider';

export function ThemeSwitcher() {
  const isDark = useThemeType() === 'dark';
  const setTheme = useSetTheme();

  return (
    <Switch
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content="Тёмная тема"
      qa="theme-switcher"
    />
  );
}
