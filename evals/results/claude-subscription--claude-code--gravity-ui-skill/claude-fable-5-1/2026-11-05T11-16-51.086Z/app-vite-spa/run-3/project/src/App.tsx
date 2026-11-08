import { ThemeProvider } from '@gravity-ui/uikit';

import { AppShell } from './AppShell';
import { AppThemeProvider, useAppTheme } from './theme/AppThemeContext';

function ThemedApp() {
  const { theme } = useAppTheme();

  return (
    <ThemeProvider theme={theme}>
      <AppShell />
    </ThemeProvider>
  );
}

export function App() {
  return (
    <AppThemeProvider>
      <ThemedApp />
    </AppThemeProvider>
  );
}
