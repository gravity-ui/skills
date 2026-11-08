import { useState } from 'react';
import { Button, ThemeProvider } from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getSavedTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The theme still changes for this session when storage is unavailable.
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <main style={{ padding: 24 }}>
        <Button view="outlined" onClick={toggleTheme} aria-pressed={theme === 'dark'}>
          Switch to {theme === 'light' ? 'dark' : 'light'} theme
        </Button>
      </main>
    </ThemeProvider>
  );
}
