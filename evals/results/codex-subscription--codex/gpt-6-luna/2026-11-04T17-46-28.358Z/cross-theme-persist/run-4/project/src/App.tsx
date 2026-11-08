import { useEffect, useState } from 'react';
import { ThemeProvider, type Theme } from '@gravity-ui/uikit';

const THEME_STORAGE_KEY = 'theme';

function getSavedTheme(): Theme {
  try {
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light';
  } catch {
    return 'light';
  }
}

function ThemeToggle({ theme, onToggle }: { theme: Theme; onToggle: () => void }) {
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      aria-pressed={isDark}
      onClick={onToggle}
      style={{
        padding: '10px 16px',
        border: '1px solid currentColor',
        borderRadius: 6,
        background: 'transparent',
        color: 'inherit',
        font: 'inherit',
        cursor: 'pointer',
      }}
    >
      Переключить на {isDark ? 'светлую' : 'тёмную'} тему
    </button>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getSavedTheme);

  useEffect(() => {
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // The app still works for this session when storage is unavailable.
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeProvider theme={theme}>
      <main style={{ minHeight: '100vh', padding: 24 }}>
        <h1>Настройки темы</h1>
        <p>Выбранная тема сохраняется и восстанавливается при следующем посещении.</p>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </main>
    </ThemeProvider>
  );
}
