import { useMemo, useState } from 'react';
import { Box, Card, Flex, SegmentedRadioGroup, Text, ThemeProvider } from '@gravity-ui/uikit';
import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';

type AppTheme = 'light' | 'dark';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const SALES = [120, 132, 101, 134, 90, 230, 210, 182, 191, 234, 290, 330];

// Line colors chosen with scripts/validate_palette.js (dataviz skill): each must reach
// >= 3:1 against its surface and sit in that mode's lightness band.
// Surfaces: light #fcfcfb, dark #1a1a19.
const LINE_COLOR: Record<AppTheme, string> = {
  light: '#2563eb',
  dark: '#4a94ea',
};

// Axes, grid, labels and tooltip come from the active theme's --g-* tokens, so only the
// series color is per-theme.
function buildChartData(theme: AppTheme): ChartData {
  return {
    xAxis: { type: 'category' },
    yAxis: [{ title: { text: 'Продажи, шт.' } }],
    legend: { enabled: false },
    series: {
      data: [
        {
          type: 'line',
          name: 'Продажи',
          color: LINE_COLOR[theme],
          data: MONTHS.map((x, i) => ({ x, y: SALES[i] })),
        },
      ],
    },
  };
}

const THEME_OPTIONS = [
  { value: 'light', content: 'Светлая' },
  { value: 'dark', content: 'Тёмная' },
];

export function App() {
  const [theme, setTheme] = useState<AppTheme>('light');
  const chartData = useMemo(() => buildChartData(theme), [theme]);

  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark') {
      setTheme(value);
    }
  };

  // ThemeProvider is the outermost provider here, so it sets the theme on <body>.
  return (
    <ThemeProvider theme={theme}>
      <Box spacing={{ p: 6 }}>
        <Flex direction="column" gap={5} style={{ maxWidth: 960, margin: '0 auto' }}>
          <Flex justifyContent="space-between" alignItems="center" gap={4}>
            <Text variant="header-1">Продажи за 2025 год</Text>
            <SegmentedRadioGroup value={theme} onUpdate={handleThemeChange} options={THEME_OPTIONS} />
          </Flex>
          <Card view="outlined" size="l">
            <Box spacing={{ p: 4 }}>
              <div style={{ height: 400 }}>
                <Chart data={chartData} />
              </div>
            </Box>
          </Card>
        </Flex>
      </Box>
    </ThemeProvider>
  );
}
