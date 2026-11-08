import { useState } from 'react';
import { Card, Flex, SegmentedRadioGroup, Text, ThemeProvider, useThemeType } from '@gravity-ui/uikit';
import type { ThemeType } from '@gravity-ui/uikit';

import { ThemedLineChart } from './ThemedLineChart';
import type { ThemedLineChartSeries } from './ThemedLineChart';

const month = (m: number) => Date.UTC(2026, m, 1);

const SALES_SERIES: ThemedLineChartSeries[] = [
  {
    name: 'Москва',
    points: [
      [month(0), 128], [month(1), 134], [month(2), 151], [month(3), 147], [month(4), 162],
      [month(5), 171], [month(6), 168], [month(7), 183], [month(8), 196], [month(9), 204],
    ],
  },
  {
    name: 'Санкт-Петербург',
    points: [
      [month(0), 84], [month(1), 88], [month(2), 95], [month(3), 101], [month(4), 99],
      [month(5), 108], [month(6), 116], [month(7), 113], [month(8), 124], [month(9), 131],
    ],
  },
  {
    name: 'Регионы',
    points: [
      [month(0), 61], [month(1), 59], [month(2), 66], [month(3), 72], [month(4), 78],
      [month(5), 75], [month(6), 83], [month(7), 91], [month(8), 97], [month(9), 102],
    ],
  },
];

function ChartDemo() {
  return (
    <Card type="container" view="outlined" spacing={{ p: 5 }}>
      <ThemedLineChart
        title="Выручка по регионам, 2026"
        yAxisTitle="млн ₽"
        series={SALES_SERIES}
        height={360}
      />
    </Card>
  );
}

export function App() {
  const appTheme = useThemeType();
  const [theme, setTheme] = useState<ThemeType>(appTheme);

  return (
    <ThemeProvider theme={theme}>
      {/* The nested ThemeProvider renders a scoped `.g-root`, which already applies the theme background and text color. */}
      <div style={{ minHeight: '100vh' }}>
        <Flex direction="column" gap={5} style={{ maxWidth: 960, margin: '0 auto', padding: 'var(--g-spacing-6)' }}>
          <Flex alignItems="center" justifyContent="space-between" gap={4} wrap>
            <Text variant="header-1">Линейный график</Text>
            <SegmentedRadioGroup<ThemeType> value={theme} onUpdate={setTheme} size="m" aria-label="Тема">
              <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
              <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
            </SegmentedRadioGroup>
          </Flex>
          <ChartDemo />
        </Flex>
      </div>
    </ThemeProvider>
  );
}
