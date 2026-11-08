import * as React from 'react';
import { Card, SegmentedRadioGroup, Text, ThemeProvider } from '@gravity-ui/uikit';

import { LineChart } from './LineChart';
import { ACTIVE_USERS_12M } from './data';
import './app.css';

type AppTheme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = React.useState<AppTheme>('light');

  // Вложенный ThemeProvider задаёт класс g-root_theme_* на своём корне,
  // и все токены (фон, текст, линии графика) переключаются для всего поддерева.
  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', padding: 24, boxSizing: 'border-box' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            marginBottom: 16,
            flexWrap: 'wrap',
          }}
        >
          <Text variant="header-1">Динамика пользователей</Text>
          <SegmentedRadioGroup
            name="app-theme"
            value={theme}
            onUpdate={(value) => setTheme(value as AppTheme)}
          >
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
        </div>

        <Card view="outlined" size="l" style={{ padding: 24, maxWidth: 960 }}>
          <LineChart
            title="Активные пользователи, тыс."
            data={ACTIVE_USERS_12M}
            unit="тыс."
          />
        </Card>
      </div>
    </ThemeProvider>
  );
}
