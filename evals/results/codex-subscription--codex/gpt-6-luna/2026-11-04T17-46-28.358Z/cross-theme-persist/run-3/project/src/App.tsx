import { useEffect, useState } from 'react';
import { Button, ThemeProvider } from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The selected theme still works for this session if storage is unavailable.
    }
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <ThemeProvider theme={theme}>
      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: 24,
          boxSizing: 'border-box',
          background: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
          transition: 'background-color 180ms ease, color 180ms ease',
        }}
      >
        <section style={{ maxWidth: 420, textAlign: 'center' }}>
          <h1 style={{ margin: '0 0 12px', fontSize: 28 }}>Тема оформления</h1>
          <p style={{ margin: '0 0 24px', color: 'var(--g-color-text-secondary)' }}>
            Сейчас включена {isDark ? 'тёмная' : 'светлая'} тема.
          </p>
          <Button
            view="action"
            size="l"
            aria-pressed={isDark}
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            Включить {isDark ? 'светлую' : 'тёмную'} тему
          </Button>
        </section>
      </main>
    </ThemeProvider>
  );
}
