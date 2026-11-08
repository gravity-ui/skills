import {useState} from 'react';
import {Switch, Text, ThemeProvider} from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme}>
      <main className="appearance">
        <section className="appearance__panel" aria-labelledby="appearance-title">
          <Text as="h1" variant="header-1" id="appearance-title">
            Оформление
          </Text>
          <Text as="p" variant="body-1" className="appearance__description">
            Выберите удобную тему интерфейса.
          </Text>
          <Switch
            size="l"
            checked={theme === 'dark'}
            onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
          >
            Тёмная тема
          </Switch>
          <Text as="p" variant="body-1" aria-live="polite" className="appearance__status">
            Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
          </Text>
        </section>
      </main>
    </ThemeProvider>
  );
}
