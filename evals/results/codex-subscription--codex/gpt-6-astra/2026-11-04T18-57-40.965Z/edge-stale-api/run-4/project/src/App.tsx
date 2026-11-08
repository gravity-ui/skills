import { useState } from 'react';
import { Switch, ThemeProvider } from '@gravity-ui/uikit';

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme} scoped>
      <main
        style={{
          boxSizing: 'border-box',
          minHeight: '100vh',
          padding: 24,
          backgroundColor: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
        }}
      >
        <h1>Тема оформления</h1>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => setTheme(checked ? 'dark' : 'light')}
        >
          Тёмная тема
        </Switch>
      </main>
    </ThemeProvider>
  );
}
