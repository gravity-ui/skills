import React from 'react';

import {Button, Icon, ThemeProvider, useThemeValue} from '@gravity-ui/uikit';
import {Moon, Sun} from '@gravity-ui/icons';

import {getInitialTheme, saveTheme} from './theme-storage';

function ThemeToggle({onToggle}: {onToggle: () => void}) {
  const theme = useThemeValue();
  const isDark = theme === 'dark';

  return (
    <Button view="outlined" size="l" onClick={onToggle}>
      <Icon data={isDark ? Sun : Moon} />
      {isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    </Button>
  );
}

export function App() {
  // Lazy initializer reads localStorage once, so the saved theme
  // is applied already on the first render after a reload.
  const [theme, setTheme] = React.useState(getInitialTheme);

  const toggleTheme = React.useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      saveTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <div style={{padding: 24}}>
        <ThemeToggle onToggle={toggleTheme} />
      </div>
    </ThemeProvider>
  );
}
