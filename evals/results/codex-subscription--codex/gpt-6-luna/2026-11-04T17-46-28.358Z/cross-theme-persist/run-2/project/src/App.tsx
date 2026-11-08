import { useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'theme';
type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <main style={{ minHeight: '100vh', padding: 24 }}>
        <h1>Настройки темы</h1>
        <p>Текущая тема: {theme === 'light' ? 'светлая' : 'тёмная'}</p>
        <button type="button" onClick={toggleTheme}>
          Включить {theme === 'light' ? 'тёмную' : 'светлую'} тему
        </button>
      </main>
    </ThemeProvider>
  );
}
