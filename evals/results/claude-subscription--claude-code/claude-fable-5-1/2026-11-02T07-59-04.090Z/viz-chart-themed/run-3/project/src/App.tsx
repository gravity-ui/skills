import * as React from 'react';
import {
  Card,
  SegmentedRadioGroup,
  Text,
  ThemeProvider,
  useThemeValue,
} from '@gravity-ui/uikit';

import { LineChart } from './LineChart';
import { activeUsers } from './data';

type ThemeChoice = 'light' | 'dark' | 'system';

export function App() {
  // Start from whatever theme the app's root ThemeProvider is configured with,
  // and let the user flip it to see the chart follow.
  const appTheme = useThemeValue();
  const [theme, setTheme] = React.useState<ThemeChoice>(() =>
    appTheme.startsWith('dark') ? 'dark' : 'light',
  );

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
            maxWidth: 880,
          }}
        >
          <Text variant="header-1">Статистика</Text>
          <SegmentedRadioGroup<ThemeChoice>
            size="m"
            value={theme}
            onUpdate={setTheme}
            aria-label="Тема приложения"
          >
            <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
        </div>

        <Card type="container" view="outlined" style={{ maxWidth: 880, padding: 20 }}>
          <LineChart data={activeUsers} />
        </Card>
      </div>
    </ThemeProvider>
  );
}
