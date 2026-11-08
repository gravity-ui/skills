import {useEffect, useState} from 'react';
import {Button, Text, ThemeProvider} from '@gravity-ui/uikit';

import './App.css';

type ColorTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'edge-stale-api-theme';

function getInitialTheme(): ColorTheme {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<ColorTheme>(getInitialTheme);
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeProvider theme={theme}>
      <main className="theme-page">
        <section className="theme-card" aria-labelledby="theme-title">
          <div className="theme-card__icon" aria-hidden="true">
            {isDarkTheme ? '☾' : '☀'}
          </div>
          <Text as="h1" className="theme-card__title" variant="header-2" id="theme-title">
            Тема оформления
          </Text>
          <Text as="p" className="theme-card__description" color="secondary" variant="body-2">
            Переключайте светлый и тёмный режим. Выбор сохранится при следующем посещении.
          </Text>
          <div className="theme-card__control">
            <Text as="span" variant="body-2">
              Сейчас включена {isDarkTheme ? 'тёмная' : 'светлая'} тема
            </Text>
            <Button
              aria-label={`Включить ${isDarkTheme ? 'светлую' : 'тёмную'} тему`}
              aria-pressed={isDarkTheme}
              onClick={toggleTheme}
              size="l"
              view="action"
            >
              Включить {isDarkTheme ? 'светлую' : 'тёмную'} тему
            </Button>
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
