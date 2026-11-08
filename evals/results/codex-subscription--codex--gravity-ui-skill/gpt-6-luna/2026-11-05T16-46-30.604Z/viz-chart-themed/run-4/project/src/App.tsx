import { Chart } from '@gravity-ui/charts';
import { Text } from '@gravity-ui/uikit';

import './App.css';

const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

const chartData = {
  xAxis: { type: 'category' as const },
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Посещения',
        data: [
          { x: 'Янв', y: 1280 },
          { x: 'Фев', y: 1540 },
          { x: 'Мар', y: 1390 },
          { x: 'Апр', y: 1870 },
          { x: 'Май', y: 2130 },
          { x: 'Июн', y: 1980 },
          { x: 'Июл', y: 2460 },
          { x: 'Авг', y: 2310 },
          { x: 'Сен', y: 2840 },
          { x: 'Окт', y: 2670 },
          { x: 'Ноя', y: 3190 },
          { x: 'Дек', y: 3560 },
        ],
      },
    ],
  },
};

export function App() {
  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <Text variant="header-2">Аналитика посещений</Text>
          <Text className="dashboard__description" variant="body-2" color="secondary">
            Динамика посещений за текущий год
          </Text>
        </div>
        <div className="dashboard__period" aria-label="Период графика">
          Январь — декабрь
        </div>
      </header>

      <section className="chart-card" aria-labelledby="chart-title">
        <div className="chart-card__heading">
          <div>
            <Text id="chart-title" variant="subheader-2">Посещения</Text>
            <Text className="chart-card__caption" variant="caption-1" color="secondary">
              Количество за месяц
            </Text>
          </div>
          <div className="chart-card__metric">
            <Text variant="header-2">3 560</Text>
            <Text variant="caption-1" color="secondary">в декабре</Text>
          </div>
        </div>

        <div className="chart-card__plot" aria-label="Линейный график посещений с января по декабрь">
          <Chart data={chartData} />
        </div>
      </section>
    </main>
  );
}
