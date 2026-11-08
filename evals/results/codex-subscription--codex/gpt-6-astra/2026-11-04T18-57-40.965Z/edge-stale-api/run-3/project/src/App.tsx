import {useState} from 'react';
import {Switch, ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

export function App() {
  const initialTheme = useThemeType();
  const [theme, setTheme] = useState<ThemeType>(initialTheme);

  return (
    <ThemeProvider theme={theme}>
      <main
        style={{
          minHeight: '100vh',
          boxSizing: 'border-box',
          padding: 24,
          backgroundColor: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
          colorScheme: theme,
        }}
      >
        <h1>Тема оформления</h1>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <p role="status">
          Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
        </p>
      </main>
    </ThemeProvider>
  );
}
