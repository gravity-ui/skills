import { useMemo, useState } from 'react';
import { Button, ThemeProvider } from '@gravity-ui/uikit';
import './app.css';

type Theme = 'light' | 'dark';

const data = [
  { month: 'Янв', value: 28 },
  { month: 'Фев', value: 35 },
  { month: 'Мар', value: 31 },
  { month: 'Апр', value: 46 },
  { month: 'Май', value: 42 },
  { month: 'Июн', value: 55 },
  { month: 'Июл', value: 51 },
  { month: 'Авг', value: 63 },
  { month: 'Сен', value: 58 },
  { month: 'Окт', value: 72 },
  { month: 'Ноя', value: 68 },
  { month: 'Дек', value: 84 },
];

function Analytics({ theme, onThemeChange }: { theme: Theme; onThemeChange: (theme: Theme) => void }) {
  const chart = useMemo(() => {
    const left = 54;
    const right = 850;
    const top = 24;
    const bottom = 248;
    const min = 0;
    const max = 100;
    const points = data.map((item, index) => ({
      ...item,
      x: left + (index * (right - left)) / (data.length - 1),
      y: bottom - ((item.value - min) / (max - min)) * (bottom - top),
    }));
    const line = points.map(({ x, y }, index) => `${index === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ');
    return { points, line, area: `${line} L ${right} ${bottom} L ${left} ${bottom} Z` };
  }, []);

  return (
    <main className="dashboard">
      <header className="topbar">
        <a className="brand" href="#overview" aria-label="Пульс — на главную">
          <span className="brand-mark" aria-hidden="true"><span /></span>
          <span>пульс</span>
        </a>
        <div className="topbar-right">
          <span className="status"><span className="status-dot" />Данные обновлены</span>
          <div className="theme-switch" aria-label="Тема приложения">
            <Button view={theme === 'light' ? 'outlined' : 'flat'} size="s" onClick={() => onThemeChange('light')} aria-pressed={theme === 'light'}>Светлая</Button>
            <Button view={theme === 'dark' ? 'outlined' : 'flat'} size="s" onClick={() => onThemeChange('dark')} aria-pressed={theme === 'dark'}>Тёмная</Button>
          </div>
        </div>
      </header>

      <section className="intro" id="overview">
        <div>
          <p className="eyebrow">ОБЗОР · 2025</p>
          <h1>Динамика показателей</h1>
          <p className="subtitle">Следите за изменением ключевой метрики в течение года.</p>
        </div>
        <Button view="outlined" size="m" className="period-button">За год <span aria-hidden="true">⌄</span></Button>
      </section>

      <section className="metric-card" aria-labelledby="metric-title">
        <div className="metric-heading">
          <div>
            <p className="metric-label" id="metric-title">Активные пользователи</p>
            <div className="metric-value">8 420 <span>чел.</span></div>
          </div>
          <div className="change-pill"><span aria-hidden="true">↗</span> 12,8% <span className="change-caption">к прошлому году</span></div>
        </div>

        <div className="chart-wrap">
          <div className="chart-y-label">Пользователи, тыс.</div>
          <svg className="chart" viewBox="0 0 900 300" role="img" aria-labelledby="chart-title chart-description" preserveAspectRatio="none">
            <title id="chart-title">Активные пользователи по месяцам</title>
            <desc id="chart-description">Линейный график показывает рост с 2,8 тысячи в январе до 8,4 тысячи в декабре.</desc>
            <defs>
              <linearGradient id="area-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" className="gradient-stop-top" />
                <stop offset="100%" className="gradient-stop-bottom" />
              </linearGradient>
            </defs>
            {[0, 25, 50, 75, 100].map((tick) => {
              const y = 248 - (tick / 100) * (248 - 24);
              return <g key={tick} className="grid-row"><line x1="54" y1={y} x2="850" y2={y} /><text x="38" y={y + 4} textAnchor="end">{tick === 0 ? '0' : tick}</text></g>;
            })}
            <path className="chart-area" d={chart.area} />
            <path className="chart-line" d={chart.line} />
            {chart.points.map((point, index) => <g key={point.month} className="chart-point"><circle cx={point.x} cy={point.y} r={index === chart.points.length - 1 ? 6 : 4} /><text x={point.x} y="279" textAnchor="middle">{point.month}</text></g>)}
          </svg>
        </div>

        <footer className="card-footer">
          <span><span className="legend-dot" />Активные пользователи</span>
          <span>Источник: продуктовая аналитика</span>
        </footer>
      </section>

      <p className="page-note">Показатели обновляются ежедневно</p>
    </main>
  );
}

export function App() {
  const [theme, setTheme] = useState<Theme>('light');
  return <ThemeProvider theme={theme}><Analytics theme={theme} onThemeChange={setTheme} /></ThemeProvider>;
}
