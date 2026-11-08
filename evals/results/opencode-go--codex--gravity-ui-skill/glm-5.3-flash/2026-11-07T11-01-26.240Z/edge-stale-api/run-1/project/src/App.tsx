import React from 'react';
import { ThemeProvider, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';

export function App() {
  const [theme, setTheme] = React.useState<AppTheme>('light');

  return (
    <ThemeProvider theme={theme}>
      <div style={{ padding: 24 }}>
        <Text variant="header-2">Настройки темы</Text>
        <SegmentedRadioGroup<AppTheme>
          value={theme}
          onUpdate={setTheme}
          size="m"
          aria-label="Выбор темы"
        >
          <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </div>
    </ThemeProvider>
  );
}
