import {useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';
import type {Theme} from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');

  return (
    <ThemeProvider theme={theme}>
      <main style={{padding: 24, minHeight: '100vh', boxSizing: 'border-box'}}>
        <h1>Оформление</h1>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
        <p role="status">Текущая тема: {theme === 'dark' ? 'тёмная' : 'светлая'}</p>
      </main>
    </ThemeProvider>
  );
}
