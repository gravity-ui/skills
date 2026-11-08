import {useState} from 'react';
import {Provider, Switch, Text, type ThemeType} from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = useState<ThemeType>('light');

  return (
    <Provider theme={theme} lang="ru">
      <main style={{padding: 24}}>
        <Text as="h1" variant="header-1">Внешний вид</Text>
        <Switch
          size="l"
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <Text as="p" color="secondary" aria-live="polite">
          Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}
        </Text>
      </main>
    </Provider>
  );
}
