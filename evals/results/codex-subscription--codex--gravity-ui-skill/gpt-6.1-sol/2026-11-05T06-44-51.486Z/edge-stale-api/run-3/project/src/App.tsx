import {useState} from 'react';
import {Switch, Text, ThemeProvider} from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme}>
      <main
        style={{
          padding: 'var(--g-spacing-6)',
          background: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
        }}
      >
        <Text as="h1" variant="header-1" style={{margin: '0 0 var(--g-spacing-4)'}}>
          Оформление
        </Text>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
          size="l"
        >
          Тёмная тема
        </Switch>
        <Text
          as="p"
          variant="body-1"
          color="secondary"
          style={{margin: 'var(--g-spacing-3) 0 0'}}
          aria-live="polite"
        >
          {theme === 'dark' ? 'Включена тёмная тема' : 'Включена светлая тема'}
        </Text>
      </main>
    </ThemeProvider>
  );
}
