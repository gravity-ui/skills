import { Switch } from '@gravity-ui/uikit';
import { useThemeSwitcher } from './theme';

const THEME_LABELS: Record<string, string> = {
  light: 'Светлая тема',
  dark: 'Тёмная тема',
  system: 'Системная тема',
};

export function App() {
  const { theme, toggleTheme } = useThemeSwitcher();

  return (
    <div style={{ padding: 24 }}>
      <Switch
        size="l"
        checked={theme === 'dark'}
        onUpdate={toggleTheme}
        content={THEME_LABELS[theme] ?? theme}
      />
    </div>
  );
}
