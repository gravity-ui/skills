import {useState} from 'react';
import {Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import type {ThemeType} from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = useState<ThemeType>('light');

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
        <Text as="h1" variant="header-2" style={{margin: '0 0 24px'}}>
          Оформление
        </Text>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <Text as="p" color="secondary" aria-live="polite">
          Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
        </Text>
      </main>
    </ThemeProvider>
  );
}
