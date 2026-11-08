import { Switch, type Theme } from '@gravity-ui/uikit';

type SwitchableTheme = Extract<Theme, 'light' | 'dark'>;

interface ThemeSwitcherProps {
  theme: SwitchableTheme;
  onChange: (theme: SwitchableTheme) => void;
}

export function ThemeSwitcher({ theme, onChange }: ThemeSwitcherProps) {
  return (
    <Switch
      size="l"
      checked={theme === 'dark'}
      onUpdate={(checked) => onChange(checked ? 'dark' : 'light')}
      content="Тёмная тема"
    />
  );
}
