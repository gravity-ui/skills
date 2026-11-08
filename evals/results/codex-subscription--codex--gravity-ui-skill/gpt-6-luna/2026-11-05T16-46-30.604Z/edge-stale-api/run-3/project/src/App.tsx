import { useState } from 'react';
import { Switch, ThemeProvider } from '@gravity-ui/uikit';

import './App.css';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const isDark = theme === 'dark';

  return (
    <ThemeProvider theme={theme}>
      <main className="theme-demo">
        <section className="theme-demo__panel" aria-labelledby="theme-title">
          <p className="theme-demo__eyebrow">Оформление интерфейса</p>
          <h1 className="theme-demo__title" id="theme-title">
            Тема приложения
          </h1>
          <p className="theme-demo__description">
            Выберите светлое или тёмное оформление.
          </p>
          <div className="theme-demo__control">
            <span className="theme-demo__mode" aria-hidden="true">
              {isDark ? 'Тёмная' : 'Светлая'}
            </span>
            <Switch
              checked={isDark}
              onChange={(event) => setTheme(event.target.checked ? 'dark' : 'light')}
              size="m"
              aria-label="Тёмная тема"
            />
          </div>
        </section>
      </main>
    </ThemeProvider>
  );
}
