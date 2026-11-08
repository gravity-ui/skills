import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';
import { Card, Flex, SegmentedRadioGroup, Text } from '@gravity-ui/uikit';

type AppTheme = 'light' | 'dark';

interface AppProps {
  theme: AppTheme;
  onThemeChange: (theme: AppTheme) => void;
}

// Colors are intentionally not set: the chart takes its palette, axis, grid
// and tooltip colors from the --g-* tokens of the surrounding ThemeProvider,
// so it follows the light/dark theme automatically.
const data: ChartData = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Посетители',
        data: [
          { x: 0, y: 120 },
          { x: 1, y: 180 },
          { x: 2, y: 150 },
          { x: 3, y: 240 },
          { x: 4, y: 210 },
          { x: 5, y: 320 },
        ],
      },
      {
        type: 'line',
        name: 'Заказы',
        data: [
          { x: 0, y: 40 },
          { x: 1, y: 65 },
          { x: 2, y: 60 },
          { x: 3, y: 95 },
          { x: 4, y: 110 },
          { x: 5, y: 150 },
        ],
      },
    ],
  },
  xAxis: {
    type: 'category',
    categories: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
  },
  yAxis: [{ title: { text: 'Количество' } }],
};

export function App({ theme, onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24, maxWidth: 800 }}>
      <Flex justifyContent="space-between" alignItems="center" gap={4}>
        <Text variant="header-1">Активность за неделю</Text>
        <SegmentedRadioGroup<AppTheme> value={theme} onUpdate={onThemeChange}>
          <SegmentedRadioGroup.Option value="light">Светлая</SegmentedRadioGroup.Option>
          <SegmentedRadioGroup.Option value="dark">Тёмная</SegmentedRadioGroup.Option>
        </SegmentedRadioGroup>
      </Flex>
      <Card type="container" view="outlined" style={{ padding: 16 }}>
        <div style={{ height: 360 }}>
          <Chart data={data} />
        </div>
      </Card>
    </Flex>
  );
}
