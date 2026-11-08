import {Chart} from '@gravity-ui/charts';
import {Text} from '@gravity-ui/uikit';

import './App.css';

const chartData = {
  colors: ['var(--g-color-base-brand)', 'var(--g-color-text-link)'],
  xAxis: {
    type: 'category' as const,
    categories: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  },
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Выручка',
        marker: {enabled: true},
        data: [
          {x: 'Янв', y: 42},
          {x: 'Фев', y: 48},
          {x: 'Мар', y: 45},
          {x: 'Апр', y: 57},
          {x: 'Май', y: 62},
          {x: 'Июн', y: 59},
          {x: 'Июл', y: 73},
          {x: 'Авг', y: 68},
          {x: 'Сен', y: 81},
          {x: 'Окт', y: 76},
          {x: 'Ноя', y: 91},
          {x: 'Дек', y: 98},
        ],
      },
      {
        type: 'line' as const,
        name: 'Расходы',
        marker: {enabled: true},
        data: [
          {x: 'Янв', y: 34},
          {x: 'Фев', y: 37},
          {x: 'Мар', y: 39},
          {x: 'Апр', y: 42},
          {x: 'Май', y: 40},
          {x: 'Июн', y: 48},
          {x: 'Июл', y: 47},
          {x: 'Авг', y: 53},
          {x: 'Сен', y: 51},
          {x: 'Окт', y: 58},
          {x: 'Ноя', y: 61},
          {x: 'Дек', y: 65},
        ],
      },
    ],
  },
};

export function App() {
  return (
    <main className="page-shell">
      <section className="chart-card" aria-labelledby="chart-title">
        <div className="chart-card__header">
          <div>
            <Text variant="subheader-2" color="secondary">ФИНАНСЫ · 2025</Text>
            <Text variant="header-2" className="chart-card__title" id="chart-title">
              Доходы и расходы
            </Text>
          </div>
          <div className="chart-card__summary" aria-label="Итог за год">
            <Text variant="caption-1" color="secondary">Выручка за год</Text>
            <Text variant="header-2" className="chart-card__total">₽ 842 тыс.</Text>
            <Text variant="body-2" className="chart-card__growth">↗ 12,8% за год</Text>
          </div>
        </div>
        <div className="chart-card__plot">
          <Chart data={chartData} />
        </div>
        <div className="chart-card__footer">
          <Text variant="caption-2" color="secondary">Данные обновлены сегодня, 09:41</Text>
          <Text variant="caption-2" color="secondary">Значения указаны в тысячах рублей</Text>
        </div>
      </section>
    </main>
  );
}
