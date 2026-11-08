import { Switch } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface ThemeSwitcherProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function ThemeSwitcher({ theme, onThemeChange }: ThemeSwitcherProps) {
  return (
    <Switch
      size="l"
      checked={theme === 'dark'}
      onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
    >
      Тёмная тема
    </Switch>
  );
}
