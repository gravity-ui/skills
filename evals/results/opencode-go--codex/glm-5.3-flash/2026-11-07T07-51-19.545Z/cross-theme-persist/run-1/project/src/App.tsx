import { Switch, useThemeValue, type Theme } from '@gravity-ui/uikit';

export const THEME_STORAGE_KEY = 'app-theme';

interface ThemeSwitcherProps {
  onThemeChange: (theme: Theme) => void;
}

export function ThemeSwitcher({ onThemeChange }: ThemeSwitcherProps) {
  const themeValue = useThemeValue();
  const isDarkTheme = themeValue === 'dark';

  return (
    <label style={{ alignItems: 'center', display: 'inline-flex', gap: 8 }}>
      <Switch checked={isDarkTheme} onChange={(event) => onThemeChange(event.target.checked ? 'dark' : 'light')} />
      {isDarkTheme ? 'Тёмная тема' : 'Светлая тема'}
    </label>
  );
}

export function App({ onThemeChange }: ThemeSwitcherProps) {
  return (
    <div style={{ padding: 24 }}>
      <ThemeSwitcher onThemeChange={onThemeChange} />
    </div>
  );
}
