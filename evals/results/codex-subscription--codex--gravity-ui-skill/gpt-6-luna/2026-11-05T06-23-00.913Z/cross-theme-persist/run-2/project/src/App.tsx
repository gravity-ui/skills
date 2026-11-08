import {useState} from 'react';
import {Switch, ThemeProvider} from '@gravity-ui/uikit';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

function getInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return storedTheme === 'dark' ? 'dark' : 'light';
}

export function App() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const handleThemeChange = (isDark: boolean) => {
    const nextTheme = isDark ? 'dark' : 'light';
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    setTheme(nextTheme);
  };

  return (
    <ThemeProvider theme={theme}>
      <div style={{padding: 24}}>
        <Switch checked={theme === 'dark'} onUpdate={handleThemeChange}>
          Тёмная тема
        </Switch>
      </div>
    </ThemeProvider>
  );
}
