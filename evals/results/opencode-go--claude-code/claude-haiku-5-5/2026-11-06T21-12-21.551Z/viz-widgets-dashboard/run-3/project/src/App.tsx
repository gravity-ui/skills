import { useState } from 'react';
import { ThemeProvider } from '@gravity-ui/uikit';
import { Dashboard } from './dashboard/Dashboard';
import './dashboard/dashboard.css';

type Theme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  // Nested provider: the dashboard's uikit controls follow the chosen theme.
  return (
    <ThemeProvider theme={theme}>
      <Dashboard theme={theme} onThemeChange={setTheme} />
    </ThemeProvider>
  );
}
