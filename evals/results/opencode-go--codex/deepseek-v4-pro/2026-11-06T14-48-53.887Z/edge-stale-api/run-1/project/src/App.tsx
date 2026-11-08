import { Switch, Text, useThemeType } from '@gravity-ui/uikit';
import { useAppTheme } from './ThemeContext';

export function App() {
  const { theme, setTheme } = useAppTheme();
  const themeType = useThemeType();

  const isDark = themeType === 'dark';

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const label =
    theme === 'system'
      ? `System (now: ${isDark ? 'dark' : 'light'})`
      : isDark
        ? 'Dark'
        : 'Light';

  return (
    <div style={{ padding: 24 }}>
      <Switch
        checked={isDark}
        onUpdate={handleToggle}
        content={
          <Text>
            Dark theme · <Text color="secondary">{label}</Text>
          </Text>
        }
      />
    </div>
  );
}
