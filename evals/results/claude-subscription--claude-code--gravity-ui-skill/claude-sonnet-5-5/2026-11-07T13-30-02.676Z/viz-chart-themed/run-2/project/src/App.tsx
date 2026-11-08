import { Card, Flex, Switch, Text } from '@gravity-ui/uikit';
import { Chart } from '@gravity-ui/charts';
import type { ChartData } from '@gravity-ui/charts';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

// Цвета серий не заданы явно: график берёт палитру и цвета осей/сетки/текста
// из токенов --g-* текущей темы, поэтому автоматически следует светлой/тёмной теме.
const chartData: ChartData = {
  series: {
    data: [
      {
        type: 'line',
        name: 'Посетители',
        data: [120, 150, 170, 160, 210, 260, 240, 280, 310, 290, 340, 380].map((y, x) => ({ x, y })),
      },
      {
        type: 'line',
        name: 'Заказы',
        data: [40, 55, 60, 58, 80, 95, 90, 110, 120, 115, 140, 160].map((y, x) => ({ x, y })),
      },
    ],
  },
  xAxis: { type: 'category', categories: MONTHS },
  yAxis: [{ title: { text: 'Количество' } }],
  legend: { enabled: true },
};

type AppProps = {
  theme?: 'light' | 'dark';
  onThemeChange?: (theme: 'light' | 'dark') => void;
};

export function App({ theme = 'light', onThemeChange }: AppProps) {
  return (
    <Flex direction="column" gap={4} style={{ padding: 24 }}>
      <Flex justifyContent="space-between" alignItems="center" gap={4}>
        <Text variant="header-1">Динамика за год</Text>
        <Switch
          checked={theme === 'dark'}
          onUpdate={(checked) => onThemeChange?.(checked ? 'dark' : 'light')}
          content="Тёмная тема"
        />
      </Flex>
      <Card view="outlined" style={{ padding: 16 }}>
        <div style={{ height: 360 }}>
          <Chart data={chartData} />
        </div>
      </Card>
    </Flex>
  );
}
