import { Switch } from '@gravity-ui/uikit';

import './App.css';

type AppProps = {
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
};

export function App({ theme, onThemeChange }: AppProps) {
  const isDark = theme === 'dark';

  return (
    <main className="theme-settings">
      <section className="theme-settings__card" aria-labelledby="theme-title">
        <div className="theme-settings__copy">
          <p className="theme-settings__eyebrow">Внешний вид</p>
          <h1 className="theme-settings__title" id="theme-title">
            Тема интерфейса
          </h1>
          <p className="theme-settings__description">
            Выберите оформление, которое вам удобнее.
          </p>
        </div>

        <div className="theme-settings__control">
          <span className="theme-settings__mode" aria-live="polite">
            {isDark ? 'Тёмная' : 'Светлая'}
          </span>
          <Switch
            size="m"
            checked={isDark}
            onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
            aria-label="Тёмная тема"
          />
        </div>
      </section>
    </main>
  );
}
