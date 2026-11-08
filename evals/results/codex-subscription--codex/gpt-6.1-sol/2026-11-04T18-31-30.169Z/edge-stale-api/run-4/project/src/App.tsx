import {useState} from 'react';
import {Switch, ThemeProvider, useThemeType} from '@gravity-ui/uikit';

export function App() {
  const inheritedTheme = useThemeType();
  const [theme, setTheme] = useState(inheritedTheme);

  return (
    <ThemeProvider theme={theme}>
      <main
        style={{
          boxSizing: 'border-box',
          minHeight: '100vh',
          padding: 24,
          backgroundColor: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
        }}
      >
        <h1>Оформление</h1>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <p role="status">Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}</p>
      </main>
    </ThemeProvider>
  );
}
