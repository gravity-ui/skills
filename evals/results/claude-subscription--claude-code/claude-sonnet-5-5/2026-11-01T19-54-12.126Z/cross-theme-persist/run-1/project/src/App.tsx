import { Switch, ThemeProvider } from '@gravity-ui/uikit';

import { useStoredTheme } from './useStoredTheme';

export function App() {
  const { theme, setTheme } = useStoredTheme();

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
          content="Тёмная тема"
        />
      </div>
    </ThemeProvider>
  );
}
