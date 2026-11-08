import { Switch } from '@gravity-ui/uikit';

import { useThemeControl } from './ThemeRoot';

export function ThemeSwitcher() {
  const { theme, setTheme } = useThemeControl();

  return (
    <Switch
      checked={theme === 'dark'}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content="Тёмная тема"
    />
  );
}
