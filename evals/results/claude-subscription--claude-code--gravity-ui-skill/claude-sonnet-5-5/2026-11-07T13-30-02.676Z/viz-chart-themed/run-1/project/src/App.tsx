import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';
import { Card, Flex, Text } from '@gravity-ui/uikit';

// Colors are not set explicitly: the chart takes its palette, axes, grid and
// tooltip colors from the --g-* tokens of the surrounding ThemeProvider,
// so it follows the light/dark theme automatically.
const chartData: ChartData = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Визиты',
        data: [
          { x: 1, y: 120 },
          { x: 2, y: 180 },
          { x: 3, y: 150 },
          { x: 4, y: 240 },
          { x: 5, y: 210 },
          { x: 6, y: 300 },
          { x: 7, y: 280 },
        ],
      },
      {
        type: 'line',
        name: 'Заказы',
        data: [
          { x: 1, y: 40 },
          { x: 2, y: 65 },
          { x: 3, y: 55 },
          { x: 4, y: 90 },
          { x: 5, y: 80 },
          { x: 6, y: 120 },
          { x: 7, y: 110 },
        ],
      },
    ],
  },
  xAxis: { title: { text: 'День недели' } },
  yAxis: [{ title: { text: 'Количество' } }],
};

export function App() {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-1">Динамика показателей</Text>
      <Card view="outlined" style={{ padding: 16 }}>
        <div style={{ height: 360, minWidth: 0 }}>
          <Chart data={chartData} />
        </div>
      </Card>
    </Flex>
  );
}
