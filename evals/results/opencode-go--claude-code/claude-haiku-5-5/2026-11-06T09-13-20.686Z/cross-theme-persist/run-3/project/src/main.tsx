// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React, { useCallback, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { AppTheme, loadStoredTheme, saveTheme } from './theme';

function Root() {
  // Начальное значение читается синхронно при монтировании, поэтому первая отрисовка
  // уже в сохранённой теме и без мигания после перезагрузки.
  const [theme, setTheme] = useState<AppTheme>(loadStoredTheme);

  const changeTheme = useCallback((next: AppTheme) => {
    saveTheme(next);
    setTheme(next);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onThemeChange={changeTheme} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
