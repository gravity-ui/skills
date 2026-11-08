import {Text} from '@gravity-ui/uikit';
import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';

const DAY = 24 * 60 * 60 * 1000;
const START = Date.UTC(2025, 0, 1);

const visits = [120, 132, 101, 134, 190, 230, 210, 245, 260, 240, 280, 310];
const orders = [40, 52, 38, 61, 80, 96, 90, 110, 118, 105, 126, 150];

const toPoints = (values: number[]) =>
  values.map((y, i) => ({x: START + i * 30 * DAY, y}));

// No hardcoded colors: the chart takes its palette, axes, grid and tooltip
// colors from the --g-* tokens of the surrounding ThemeProvider, so it follows
// the current light/dark theme automatically.
const data: ChartData = {
  series: {
    data: [
      {type: 'line', name: 'Визиты', data: toPoints(visits)},
      {type: 'line', name: 'Заказы', data: toPoints(orders)},
    ],
  },
  xAxis: {type: 'datetime'},
  yAxis: [{title: {text: 'Количество'}}],
};

export function App() {
  return (
    <div style={{padding: 24}}>
      <Text variant="header-1" as="h1">
        Динамика за год
      </Text>
      <div style={{height: 360, marginTop: 16}}>
        <Chart data={data} />
      </div>
    </div>
  );
}
