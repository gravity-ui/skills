import {Chart} from '@gravity-ui/charts';

import './App.css';

const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
const revenue = [128, 142, 137, 166, 159, 184, 207, 198, 224, 236, 229, 268];

const chartData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Выручка, тыс. ₽',
        data: revenue.map((value, index) => ({x: index, y: value})),
        marker: {enabled: true},
      },
    ],
  },
  xAxis: {
    type: 'category' as const,
    categories: months,
  },
};

export function App() {
  return (
    <main className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">АНАЛИТИКА · 2025</p>
          <h1 className="dashboard__title">Выручка</h1>
          <p className="dashboard__description">Динамика продаж за год</p>
        </div>
        <span className="dashboard__period">Январь — декабрь</span>
      </header>

      <section className="revenue-card" aria-labelledby="revenue-title">
        <div className="revenue-card__summary">
          <div>
            <p className="revenue-card__label" id="revenue-title">Итого за декабрь</p>
            <p className="revenue-card__value">268 <span>тыс. ₽</span></p>
          </div>
          <div className="revenue-card__change" aria-label="Рост на 17 процентов к ноябрю">
            <span className="revenue-card__change-value">↗ 17%</span>
            <span className="revenue-card__change-label">к ноябрю</span>
          </div>
        </div>

        <div className="revenue-card__chart" role="img" aria-label="Линейный график выручки по месяцам: рост со 128 тысяч рублей в январе до 268 тысяч рублей в декабре">
          <Chart data={chartData} />
        </div>

        <footer className="revenue-card__footer">
          <span>Выручка, тыс. ₽</span>
          <span>Источник: продажи</span>
        </footer>
      </section>
    </main>
  );
}
