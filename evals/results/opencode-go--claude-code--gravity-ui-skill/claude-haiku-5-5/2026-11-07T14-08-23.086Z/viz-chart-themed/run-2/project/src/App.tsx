import {Chart} from '@gravity-ui/charts';
import type {ChartProps} from '@gravity-ui/charts';
import {Card, Text, useThemeType} from '@gravity-ui/uikit';

const MONTHS = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const REVENUE = [120, 132, 128, 145, 160, 158, 172, 180, 176, 190, 205, 214];
const EXPENSES = [90, 95, 93, 101, 108, 110, 115, 119, 122, 127, 131, 135];
const PROFIT = REVENUE.map((value, i) => value - EXPENSES[i]);

// Семантические токены uikit: для светлой и тёмной темы они задают разные значения,
// поэтому линии адаптируются к текущей теме без условной логики.
const SERIES_COLORS = {
  revenue: 'var(--g-color-text-info)',
  expenses: 'var(--g-color-text-danger)',
  profit: 'var(--g-color-text-positive)',
};

const toPoints = (values: number[]) => MONTHS.map((x, i) => ({x, y: values[i]}));

const chartData: ChartProps['data'] = {
  xAxis: {type: 'category', categories: MONTHS},
  legend: {enabled: true},
  series: {
    data: [
      {
        type: 'line',
        name: 'Выручка',
        color: SERIES_COLORS.revenue,
        marker: {enabled: true},
        data: toPoints(REVENUE),
      },
      {
        type: 'line',
        name: 'Расходы',
        color: SERIES_COLORS.expenses,
        marker: {enabled: true},
        data: toPoints(EXPENSES),
      },
      {
        type: 'line',
        name: 'Прибыль',
        color: SERIES_COLORS.profit,
        marker: {enabled: true},
        data: toPoints(PROFIT),
      },
    ],
  },
};

export function App() {
  const themeType = useThemeType();
  const themeName = themeType === 'dark' ? 'тёмная' : 'светлая';

  return (
    <div style={{padding: 24, maxWidth: 960}}>
      <Text variant="header-1" as="h1">
        Выручка, расходы и прибыль за 2026 год
      </Text>
      <div style={{marginTop: 8, marginBottom: 16}}>
        <Text color="secondary">Текущая тема: {themeName}. Цвета графика берутся из токенов темы.</Text>
      </div>
      <Card view="outlined" size="l">
        <div style={{height: 420, padding: 16}}>
          <Chart data={chartData} lang="ru" />
        </div>
      </Card>
    </div>
  );
}
