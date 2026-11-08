import {useState} from 'react';
import {Provider, Switch, Text, useThemeValue} from '@gravity-ui/uikit';

import './App.css';

type AppTheme = 'light' | 'dark';

function ThemeSettings({onThemeChange}: {onThemeChange: (theme: AppTheme) => void}) {
  const theme = useThemeValue();

  return (
    <main className="theme-settings">
      <section className="theme-settings__card" aria-labelledby="theme-heading">
        <Text as="h1" variant="header-2" id="theme-heading">
          Внешний вид
        </Text>
        <Text as="p" color="secondary" className="theme-settings__description">
          Выберите удобную тему оформления.
        </Text>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <Text as="p" color="secondary" aria-live="polite" className="theme-settings__status">
          Сейчас включена {theme === 'dark' ? 'тёмная' : 'светлая'} тема.
        </Text>
      </section>
    </main>
  );
}

export function App() {
  const [theme, setTheme] = useState<AppTheme>('light');

  return (
    <Provider theme={theme} lang="ru">
      <ThemeSettings onThemeChange={setTheme} />
    </Provider>
  );
}
