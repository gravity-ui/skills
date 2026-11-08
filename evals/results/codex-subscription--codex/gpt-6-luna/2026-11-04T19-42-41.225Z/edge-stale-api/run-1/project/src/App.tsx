import {useState} from 'react';
import {Provider, Switch} from '@gravity-ui/uikit';
import './App.css';

type ThemeMode = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = useState<ThemeMode>('light');

  return (
    <Provider theme={theme}>
      <main className="theme-page">
        <section className="theme-card" aria-labelledby="theme-title">
          <div className="theme-card__eyebrow">Настройки отображения</div>
          <h1 className="theme-card__title" id="theme-title">Тема оформления</h1>
          <p className="theme-card__description">
            Выберите тему, которая будет комфортна для вас.
          </p>
          <div className="theme-card__control">
            <Switch
              size="l"
              checked={theme === 'dark'}
              onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
              aria-label="Тёмная тема"
              content="Тёмная тема"
            />
            <span className="theme-card__mode" aria-live="polite">
              {theme === 'dark' ? 'Включена' : 'Выключена'}
            </span>
          </div>
        </section>
      </main>
    </Provider>
  );
}
