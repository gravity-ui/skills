import { Switch } from '@gravity-ui/uikit';

import { useAppTheme } from './AppThemeProvider';

export function ThemeSwitcher() {
  const { theme, setTheme } = useAppTheme();

  return (
    <Switch
      size="l"
      checked={theme === 'dark'}
      onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
      content="Тёмная тема"
    />
  );
}
