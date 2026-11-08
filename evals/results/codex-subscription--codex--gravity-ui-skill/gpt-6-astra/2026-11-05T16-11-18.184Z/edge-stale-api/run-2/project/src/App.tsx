import {useState} from 'react';
import {Switch, Text, ThemeProvider} from '@gravity-ui/uikit';
import './App.css';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme}>
      <main className="appearance">
        <Text as="h1" variant="header-1" className="appearance__title">
          Оформление
        </Text>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <Text as="p" variant="body-2" color="secondary" aria-live="polite">
          Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
        </Text>
      </main>
    </ThemeProvider>
  );
}
