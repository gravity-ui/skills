import React from 'react';
import { SegmentedRadioGroup, ThemeProvider } from '@gravity-ui/uikit';

import { LineChart } from './LineChart';

const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const series = [
  { name: 'Органика', values: [4200, 4500, 4900, 5300, 5100, 5800, 6400, 6900, 7300, 7900, 8600, 9400] },
  { name: 'Реклама', values: [2800, 3100, 3000, 3600, 4200, 4100, 4700, 4500, 5200, 5000, 5600, 6100] },
  { name: 'Рефералы', values: [1100, 1200, 1500, 1400, 1800, 2100, 2000, 2400, 2300, 2800, 3000, 3300] },
];

export function App() {
  // The chart reads the theme from ThemeProvider, so switching here re-themes it.
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          minHeight: '100vh',
          padding: 24,
          boxSizing: 'border-box',
          background: 'var(--g-color-base-background)',
          color: 'var(--g-color-text-primary)',
        }}
      >
        <div style={{ maxWidth: 840, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <SegmentedRadioGroup value={theme} onUpdate={setTheme} size="m">
              <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            </SegmentedRadioGroup>
          </div>
          <LineChart
            title="Визиты по каналам"
            subtitle="Визитов в месяц, 2026"
            categories={months}
            series={series}
          />
        </div>
      </div>
    </ThemeProvider>
  );
}
