import {useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme';

function getInitialTheme(): Theme {
  try {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function handleThemeChange(checked: boolean) {
    const nextTheme = checked ? 'dark' : 'light';
    setTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Keep the switch usable when browser storage is unavailable.
    }
  }

  return (
    <ThemeProvider theme={theme}>
      <main style={{padding: 'var(--g-spacing-6)'}}>
        <Switch checked={theme === 'dark'} onUpdate={handleThemeChange}>
          Тёмная тема
        </Switch>
      </main>
    </ThemeProvider>
  );
}
