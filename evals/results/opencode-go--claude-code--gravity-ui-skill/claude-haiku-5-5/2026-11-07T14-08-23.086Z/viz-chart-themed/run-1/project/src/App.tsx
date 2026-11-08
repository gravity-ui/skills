import {Chart} from '@gravity-ui/charts';
import type {ChartData} from '@gravity-ui/charts';
import {Card, Text} from '@gravity-ui/uikit';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

// Цвета линий и фон/оси/подписи берутся из токенов --g-* активной темы
// (ThemeProvider в main.tsx), поэтому график автоматически совпадает со светлой/тёмной темой.
const chartData: ChartData = {
  xAxis: {type: 'category', categories: MONTHS},
  legend: {enabled: true},
  series: {
    data: [
      {
        type: 'line',
        name: 'Заказы',
        marker: {enabled: true},
        data: [
          {x: 'Янв', y: 120},
          {x: 'Фев', y: 135},
          {x: 'Мар', y: 150},
          {x: 'Апр', y: 142},
          {x: 'Май', y: 170},
          {x: 'Июн', y: 188},
          {x: 'Июл', y: 195},
          {x: 'Авг', y: 210},
          {x: 'Сен', y: 204},
          {x: 'Окт', y: 230},
          {x: 'Ноя', y: 248},
          {x: 'Дек', y: 265},
        ],
      },
      {
        type: 'line',
        name: 'Возвраты',
        marker: {enabled: true},
        data: [
          {x: 'Янв', y: 8},
          {x: 'Фев', y: 10},
          {x: 'Мар', y: 7},
          {x: 'Апр', y: 12},
          {x: 'Май', y: 9},
          {x: 'Июн', y: 11},
          {x: 'Июл', y: 14},
          {x: 'Авг', y: 10},
          {x: 'Сен', y: 13},
          {x: 'Окт', y: 12},
          {x: 'Ноя', y: 15},
          {x: 'Дек', y: 11},
        ],
      },
    ],
  },
};

export function App() {
  return (
    <div style={{padding: 24}}>
      <Card type="container" view="outlined" size="l">
        <Text variant="header-2">Заказы и возвраты за 2026 год</Text>
        <Text variant="body-2" color="secondary">
          Помесячная динамика, шт.
        </Text>
        <div style={{height: 360, marginTop: 16}}>
          <Chart data={chartData} />
        </div>
      </Card>
    </div>
  );
}
