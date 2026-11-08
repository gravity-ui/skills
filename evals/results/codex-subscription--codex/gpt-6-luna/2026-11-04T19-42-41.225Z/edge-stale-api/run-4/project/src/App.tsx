import {useState} from 'react';
import {Button, Text, ThemeProvider} from '@gravity-ui/uikit';

import './App.css';

type ColorTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'gravity-ui-eval-theme';

function getInitialTheme(): ColorTheme {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<ColorTheme>(getInitialTheme);
  const nextTheme: ColorTheme = theme === 'light' ? 'dark' : 'light';

  const toggleTheme = () => {
    setTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The theme still works for this session when storage is unavailable.
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <main className="theme-page">
        <section className="theme-panel" aria-labelledby="theme-title">
          <div className="theme-panel__topline">
            <span className="theme-panel__mark" aria-hidden="true">G</span>
            <Text variant="body-2" color="secondary">Настройки интерфейса</Text>
          </div>

          <Text as="h1" variant="display-2" className="theme-panel__title" id="theme-title">
            Тема оформления
          </Text>
          <Text variant="body-1" color="secondary" className="theme-panel__description">
            Выберите комфортный режим. Настройка сохранится при следующем посещении.
          </Text>

          <div className="theme-control">
            <div className="theme-control__copy" aria-live="polite">
              <Text variant="subheader-2">{theme === 'light' ? 'Светлая тема' : 'Тёмная тема'}</Text>
              <Text variant="body-2" color="secondary">
                Сейчас включена {theme === 'light' ? 'светлая' : 'тёмная'} тема
              </Text>
            </div>
            <Button
              view="action"
              size="l"
              onClick={toggleTheme}
              aria-label={`Включить ${nextTheme === 'light' ? 'светлую' : 'тёмную'} тему`}
            >
              <span className="theme-control__icon" aria-hidden="true">
                {theme === 'light' ? '☾' : '☀'}
              </span>
              {nextTheme === 'light' ? 'Светлая' : 'Тёмная'}
            </Button>
          </div>

          <div className="theme-preview" aria-label="Предпросмотр интерфейса">
            <div className="theme-preview__bar">
              <span />
              <span />
              <span />
            </div>
            <div className="theme-preview__content">
              <div className="theme-preview__line theme-preview__line--strong" />
              <div className="theme-preview__line" />
              <div className="theme-preview__line theme-preview__line--short" />
              <div className="theme-preview__button" />
            </div>
          </div>
        </section>
        <footer className="theme-page__footer">
          <Text variant="caption-2" color="secondary">Оформление на базе Gravity UI</Text>
        </footer>
      </main>
    </ThemeProvider>
  );
}
