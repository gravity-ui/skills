import React from 'react';
import { Button, ThemeProvider, type Theme } from '@gravity-ui/uikit';
import { ThemedLineChart } from './ThemedLineChart';

const days = Array.from({ length: 14 }, (_, i) => `${i + 1} окт`);
const visits = [820, 932, 901, 934, 1090, 1130, 980, 1210, 1340, 1290, 1420, 1510, 1470, 1620];
const signups = [120, 132, 101, 134, 190, 230, 210, 250, 280, 260, 310, 330, 320, 380];

export function App() {
  const [theme, setTheme] = React.useState<Theme>('light');

  return (
    // Scoped provider: the whole subtree (including the chart) follows `theme`.
    <ThemeProvider theme={theme} scoped rootClassName="app-root">
      <div style={{ padding: 24, minHeight: '100vh', background: 'var(--g-color-base-background)' }}>
        <div style={{ marginBottom: 16 }}>
          <Button view="outlined" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            Тема: {theme === 'light' ? 'светлая' : 'тёмная'}
          </Button>
        </div>
        <div style={{ maxWidth: 720 }}>
          <ThemedLineChart
            title="Посещения и регистрации за 14 дней"
            categories={days}
            series={[
              { name: 'Посещения', values: visits },
              { name: 'Регистрации', values: signups },
            ]}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
