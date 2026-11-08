import { useEffect, useState } from 'react';
import { Switch, ThemeProvider } from '@gravity-ui/uikit';
import './App.css';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'edge-stale-api-theme';

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  return (
    <ThemeProvider theme={theme}>
      <main className="theme-demo">
        <section className="theme-card" aria-labelledby="theme-title">
          <div className="theme-card__copy">
            <h1 id="theme-title" className="theme-card__title">Настройки темы</h1>
            <p className="theme-card__description">
              Выберите оформление интерфейса
            </p>
          </div>
          <Switch
            checked={theme === 'dark'}
            content="Тёмная тема"
            onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
          />
        </section>
      </main>
    </ThemeProvider>
  );
}
