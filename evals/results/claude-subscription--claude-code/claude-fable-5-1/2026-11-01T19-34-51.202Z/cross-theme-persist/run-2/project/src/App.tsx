import { Card, Text, ThemeProvider } from '@gravity-ui/uikit';

import { ThemeSwitcher } from './ThemeSwitcher';
import { useStoredTheme } from './useStoredTheme';

export function App() {
  const [theme, setTheme] = useStoredTheme();

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card view="filled" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Text variant="subheader-2">Theme</Text>
          <ThemeSwitcher value={theme} onChange={setTheme} />
        </Card>
        <Text variant="body-1" color="secondary">
          Current theme: <Text variant="body-1" color="primary" qa="current-theme">{theme}</Text>.
          The choice is saved to localStorage and restored on reload.
        </Text>
      </div>
    </ThemeProvider>
  );
}
