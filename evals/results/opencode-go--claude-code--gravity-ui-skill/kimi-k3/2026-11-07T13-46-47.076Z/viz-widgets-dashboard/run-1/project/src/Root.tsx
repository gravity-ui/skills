import React from 'react';
import {ThemeProvider} from '@gravity-ui/uikit';

import {App} from './App';

export function Root() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  const toggleTheme = React.useCallback(() => {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <App theme={theme} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  );
}
