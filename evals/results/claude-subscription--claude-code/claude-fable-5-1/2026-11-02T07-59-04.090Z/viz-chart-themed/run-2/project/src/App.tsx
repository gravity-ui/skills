import React from 'react';
import { Card, Flex, SegmentedRadioGroup, Text, ThemeProvider, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import { activeUsersByPlatform } from './chartData';
import { ThemedLineChart } from './ThemedLineChart';
import './App.css';

/**
 * The chart itself only needs to live inside a Gravity UI ThemeProvider:
 * it reads the current theme from context and uses Gravity tokens for
 * everything else, so it follows whatever theme the application is in.
 *
 * The page below adds a preview switch so both looks can be checked
 * without touching the app-level provider in main.tsx.
 */
export function App() {
  const appTheme = useThemeType();
  const [previewTheme, setPreviewTheme] = React.useState<ThemeType>(appTheme);
  React.useEffect(() => setPreviewTheme(appTheme), [appTheme]);

  return (
    <ThemeProvider theme={previewTheme}>
      <Page previewTheme={previewTheme} onPreviewThemeChange={setPreviewTheme} />
    </ThemeProvider>
  );
}

interface PageProps {
  previewTheme: ThemeType;
  onPreviewThemeChange: (theme: ThemeType) => void;
}

function Page({ previewTheme, onPreviewThemeChange }: PageProps) {
  const [view, setView] = React.useState<'chart' | 'table'>('chart');
  const data = activeUsersByPlatform;

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 24,
        boxSizing: 'border-box',
        background: 'var(--g-color-base-background)',
        color: 'var(--g-color-text-primary)',
        colorScheme: previewTheme,
      }}
    >
      <Flex justifyContent="space-between" alignItems="center" gap={4} style={{ marginBottom: 16 }}>
        <Text variant="header-1">Аналитика</Text>
        <SegmentedRadioGroup<ThemeType> value={previewTheme} onUpdate={onPreviewThemeChange} size="m">
          <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </Flex>

      <Card type="container" view="outlined" style={{ padding: 20, maxWidth: 960 }}>
        <Flex justifyContent="space-between" alignItems="flex-start" gap={4} style={{ marginBottom: 16 }}>
          <div>
            <Text as="div" variant="subheader-2">
              {data.title}
            </Text>
            <Text as="div" variant="body-1" color="secondary">
              {data.subtitle}
            </Text>
          </div>
          <SegmentedRadioGroup<'chart' | 'table'> value={view} onUpdate={setView} size="s">
            <SegmentedRadioGroup.Option value="chart">График</SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="table">Таблица</SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
        </Flex>

        <ThemedLineChart data={data} view={view} />
      </Card>
    </div>
  );
}
