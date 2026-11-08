import { useState } from 'react';
import { Button, ThemeProvider, type Theme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'app-theme';

function getSavedTheme(): Theme {
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return savedTheme === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <main style={{ padding: 24 }}>
        <Button onClick={toggleTheme}>
          Переключить на {theme === 'light' ? 'тёмную' : 'светлую'} тему
        </Button>
      </main>
    </ThemeProvider>
  );
}
