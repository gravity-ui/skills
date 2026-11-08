import { Switch } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

interface ThemeSwitchProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function ThemeSwitch({ theme, onThemeChange }: ThemeSwitchProps) {
  return (
    <Switch
      size="l"
      checked={theme === 'dark'}
      onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      content="Тёмная тема"
    />
  );
}
