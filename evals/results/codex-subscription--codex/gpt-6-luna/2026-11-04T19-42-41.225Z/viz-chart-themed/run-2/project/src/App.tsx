import {useTheme} from '@gravity-ui/uikit';
import './App.css';

const points = [
  {label: '1 июн', value: 18},
  {label: '5 июн', value: 25},
  {label: '9 июн', value: 21},
  {label: '13 июн', value: 34},
  {label: '17 июн', value: 29},
  {label: '21 июн', value: 42},
  {label: '25 июн', value: 38},
  {label: '30 июн', value: 56},
];

const chart = {left: 48, right: 730, top: 20, bottom: 230};
const coordinates = points.map((point, index) => ({
  x: chart.left + (index * (chart.right - chart.left)) / (points.length - 1),
  y: chart.bottom - (point.value / 60) * (chart.bottom - chart.top),
}));
const line = coordinates.map(({x, y}) => `${x},${y}`).join(' ');
const area = `${chart.left},${chart.bottom} ${line} ${chart.right},${chart.bottom}`;

export function App() {
  const theme = useTheme();

  return (
    <main className="page" data-theme={theme}>
      <section className="analytics-card" aria-labelledby="chart-title">
        <header className="card-header">
          <div>
            <p className="eyebrow">АНАЛИТИКА</p>
            <h1 id="chart-title">Активность за месяц</h1>
            <p className="subtitle">Количество событий по дням</p>
          </div>
          <div className="period" aria-label="Период: июнь 2024">Июнь 2024 <span aria-hidden="true">⌄</span></div>
        </header>

        <div className="summary">
          <div className="total">1 284 <span>события</span></div>
          <div className="growth"><span className="growth-arrow" aria-hidden="true">↗</span> 12,8% <span className="growth-note">к прошлому месяцу</span></div>
        </div>

        <div className="chart-wrap">
          <div className="y-labels" aria-hidden="true"><span>60</span><span>45</span><span>30</span><span>15</span><span>0</span></div>
          <svg className="chart" viewBox="0 0 760 270" role="img" aria-labelledby="svg-title svg-desc" preserveAspectRatio="none">
            <title id="svg-title">График активности за июнь</title>
            <desc id="svg-desc">Линейный график показывает рост числа событий с 18 до 56 за период с 1 по 30 июня.</desc>
            {[20, 72.5, 125, 177.5, 230].map((y) => <line key={y} className="grid-line" x1={chart.left} y1={y} x2={chart.right} y2={y} />)}
            <polygon className="chart-area" points={area} />
            <polyline className="chart-line" points={line} />
            {coordinates.map(({x, y}, index) => <circle className="chart-point" key={points[index].label} cx={x} cy={y} r="4" />)}
          </svg>
          <div className="x-labels" aria-hidden="true">{points.map(({label}) => <span key={label}>{label}</span>)}</div>
        </div>

        <footer className="chart-footer"><span className="legend-dot" /> События <span className="footer-note">Данные обновлены сегодня</span></footer>
      </section>
    </main>
  );
}
