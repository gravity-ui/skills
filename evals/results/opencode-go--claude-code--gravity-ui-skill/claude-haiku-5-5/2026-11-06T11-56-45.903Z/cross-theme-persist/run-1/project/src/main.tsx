// Preconfigured Gravity UI setup is ALREADY wired here (both CSS imports + ThemeProvider).
// Implement the requested feature in App.tsx (you may add sibling files).
import '@gravity-ui/uikit/styles/fonts.css';
import '@gravity-ui/uikit/styles/styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import { App } from './App';
import { AppThemeProvider } from './AppThemeProvider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* AppThemeProvider хранит выбранную тему и передаёт её в ThemeProvider из uikit. */}
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  </React.StrictMode>,
);
