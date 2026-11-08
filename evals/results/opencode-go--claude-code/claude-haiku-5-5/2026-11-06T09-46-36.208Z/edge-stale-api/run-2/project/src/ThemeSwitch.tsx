import { Switch, type ThemeType } from '@gravity-ui/uikit';

export interface ThemeSwitchProps {
  theme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export function ThemeSwitch({ theme, onThemeChange }: ThemeSwitchProps) {
  return (
    <Switch
      size="l"
      checked={theme === 'dark'}
      onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
      qa="theme-switch"
    >
      Тёмная тема
    </Switch>
  );
}
