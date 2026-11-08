import {Chart} from '@gravity-ui/charts';

import './App.css';

const chartData = {
  series: {
    data: [
      {
        type: 'line' as const,
        name: 'Активные пользователи',
        color: 'var(--g-color-text-brand)',
        interpolation: {type: 'monotone' as const},
        data: [
          {x: 0, y: 24},
          {x: 1, y: 31},
          {x: 2, y: 28},
          {x: 3, y: 43},
          {x: 4, y: 39},
          {x: 5, y: 56},
          {x: 6, y: 63},
          {x: 7, y: 58},
          {x: 8, y: 76},
          {x: 9, y: 84},
          {x: 10, y: 79},
          {x: 11, y: 96},
        ],
      },
    ],
  },
};

export function App() {
  return (
    <main className="page">
      <section className="chart-card" aria-labelledby="chart-title">
        <header className="chart-card__header">
          <div>
            <p className="chart-card__eyebrow">ОБЗОР</p>
            <h1 id="chart-title" className="chart-card__title">
              Активность пользователей
            </h1>
            <p className="chart-card__description">Динамика за последние 12 месяцев</p>
          </div>
          <div className="chart-card__metric" aria-label="Рост 18,6 процента">
            <span className="chart-card__metric-value">+18,6%</span>
            <span className="chart-card__metric-caption">за год</span>
          </div>
        </header>

        <div className="chart-card__plot" role="img" aria-label="Линейный график активности пользователей с устойчивым ростом за год">
          <Chart data={chartData} />
        </div>
        <footer className="chart-card__footer">
          <span className="chart-card__legend-dot" aria-hidden="true" />
          <span>Активные пользователи</span>
          <span className="chart-card__unit">тыс.</span>
        </footer>
      </section>
    </main>
  );
}
