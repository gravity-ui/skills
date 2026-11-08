// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@gravity-ui/uikit';

import { App } from './App';
import { type AppTheme, getInitialTheme, saveTheme } from './themeStorage';

// Состояние темы живёт у корневого ThemeProvider: только он (не scoped)
// выставляет класс темы на <body>, так что фон страницы и порталы
// (попапы, тултипы) тоже переключаются.
function Root() {
  const [theme, setTheme] = React.useState<AppTheme>(getInitialTheme);

  const handleThemeChange = React.useCallback((next: AppTheme) => {
    setTheme(next);
    saveTheme(next);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App onThemeChange={handleThemeChange} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);
