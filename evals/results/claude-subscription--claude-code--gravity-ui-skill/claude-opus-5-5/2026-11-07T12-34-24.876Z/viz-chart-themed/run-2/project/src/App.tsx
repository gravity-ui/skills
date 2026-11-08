import { Chart, type ChartData } from '@gravity-ui/charts';
import { Card, Flex, Text } from '@gravity-ui/uikit';

import { visitsSeries } from './data';

// Theme-awareness: the chart takes no theme prop. Its axes, grid, labels,
// legend and tooltip are styled with uikit `--g-color-*` tokens, so they
// follow the theme of the surrounding ThemeProvider (light/dark), and they
// re-theme when it switches. Series colors come from the library's default
// palette, which is built to read on both themes. Nothing here hardcodes a color.
const chartData: ChartData = {
  xAxis: {
    type: 'datetime',
    grid: { enabled: false },
  },
  yAxis: [
    {
      title: { text: 'Visits, thousands' },
    },
  ],
  legend: { enabled: true },
  tooltip: { valueFormat: { type: 'number', precision: 1 } },
  series: {
    data: visitsSeries.map((s) => ({
      type: 'line' as const,
      name: s.name,
      data: s.points,
      interpolation: { type: 'monotone' as const },
    })),
  },
};

export function App() {
  return (
    <div style={{ padding: 'var(--g-spacing-6)' }}>
      <Card view="outlined" type="container" style={{ padding: 'var(--g-spacing-5)' }}>
        <Flex direction="column" gap={4}>
          <Flex direction="column" gap={1}>
            <Text variant="subheader-3">Site traffic</Text>
            <Text variant="body-1" color="secondary">
              Daily visits over the last 30 days
            </Text>
          </Flex>
          {/* Chart fills its parent: the wrapper must have an explicit height. */}
          <div style={{ height: 360, minWidth: 0 }}>
            <Chart data={chartData} />
          </div>
        </Flex>
      </Card>
    </div>
  );
}
