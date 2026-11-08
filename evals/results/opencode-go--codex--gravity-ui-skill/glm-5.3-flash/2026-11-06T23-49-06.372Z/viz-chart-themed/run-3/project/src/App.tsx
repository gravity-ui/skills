import { Chart } from '@gravity-ui/charts';
import { Card, Flex, Text } from '@gravity-ui/uikit';

const chartData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Пользователи',
        data: [
          { x: 0, y: 120 },
          { x: 1, y: 180 },
          { x: 2, y: 150 },
          { x: 3, y: 210 },
          { x: 4, y: 240 },
          { x: 5, y: 220 },
          { x: 6, y: 280 },
        ],
      },
    ],
  },
  xAxis: {
    type: 'category' as const,
    categories: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
  },
};

export function App() {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Text variant="header-2">Активность за неделю</Text>
      <Card>
        <div style={{ height: 320 }}>
          <Chart data={chartData} />
        </div>
      </Card>
    </Flex>
  );
}
