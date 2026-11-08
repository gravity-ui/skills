import { Switch, useThemeType } from '@gravity-ui/uikit';

import { useSetTheme } from './theme';

export function ThemeToggle() {
  // Current resolved theme type ('light' | 'dark') from the Gravity UI theme context
  const themeType = useThemeType();
  const setTheme = useSetTheme();
  const isDark = themeType === 'dark';

  return (
    <Switch
      size="m"
      checked={isDark}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content={isDark ? 'Тёмная тема' : 'Светлая тема'}
    />
  );
}
