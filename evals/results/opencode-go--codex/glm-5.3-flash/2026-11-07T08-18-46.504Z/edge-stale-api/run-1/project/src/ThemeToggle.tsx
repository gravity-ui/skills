import { useTheme, Switch } from '@gravity-ui/uikit';
import type { RealTheme } from '@gravity-ui/uikit';

interface ThemeToggleProps {
  onThemeChange: (theme: RealTheme) => void;
}

export function ThemeToggle({ onThemeChange }: ThemeToggleProps) {
  const theme = useTheme();

  return (
    <Switch
      checked={theme === 'dark'}
      onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
    >
      Dark theme
    </Switch>
  );
}
