import { useMemo, useState } from 'react';
import { useThemeType } from '@gravity-ui/uikit';
import './app.css';

const values = [32, 38, 35, 52, 47, 59, 55, 72, 68, 81, 75, 91];
const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];

type AppProps = { onThemeToggle: () => void };

export function App({ onThemeToggle }: AppProps) {
  const theme = useThemeType();
  const isDark = theme === 'dark';
  const [period, setPeriod] = useState('12 месяцев');
  const [activePoint, setActivePoint] = useState(11);
  const chart = useMemo(() => {
    const width = 760;
    const height = 300;
    const left = 46;
    const right = 10;
    const top = 18;
    const bottom = 34;
    const x = (i: number) => left + i * ((width - left - right) / (values.length - 1));
    const y = (v: number) => top + (100 - v) * ((height - top - bottom) / 100);
    const line = values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
    return { width, height, left, right, top, bottom, x, y, line, area: `${line} L ${x(values.length - 1)} ${height - bottom} L ${x(0)} ${height - bottom} Z` };
  }, []);

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="dashboard">
        <header className="topbar">
          <a className="brand" href="#overview" aria-label="Lumen аналитика">
            <span className="brand-mark"><span /></span>
            <span>lumen<span className="brand-dot">.</span></span>
          </a>
          <nav className="main-nav" aria-label="Основная навигация">
            <a className="nav-link active" href="#overview">Обзор</a>
            <a className="nav-link" href="#reports">Отчёты</a>
            <a className="nav-link" href="#audience">Аудитория</a>
          </nav>
          <div className="topbar-actions">
            <button className="icon-button theme-toggle" onClick={onThemeToggle} aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'} title="Сменить тему">
              {isDark ? <SunIcon /> : <MoonIcon />}
            </button>
            <button className="profile-button" aria-label="Профиль пользователя"><span>АК</span><span className="profile-chevron">⌄</span></button>
          </div>
        </header>

        <section className="page-heading" id="overview">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> ПОНЕДЕЛЬНИК, 4 НОЯБРЯ 2026</p>
            <h1>Добрый день, Анна <span className="wave">✦</span></h1>
            <p className="subtitle">Вот что происходит с вашим проектом сегодня.</p>
          </div>
          <button className="export-button"><DownloadIcon /> Экспорт отчёта</button>
        </section>

        <section className="stats-grid" aria-label="Ключевые показатели">
          <article className="stat-card">
            <div className="stat-top"><span className="stat-label">Общий доход</span><span className="stat-icon revenue"><WalletIcon /></span></div>
            <div className="stat-value">₽ 2 846 390</div>
            <div className="stat-foot"><span className="change positive"><ArrowUpIcon /> 12,8%</span><span>к прошлому месяцу</span></div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span className="stat-label">Активные клиенты</span><span className="stat-icon customers"><UsersIcon /></span></div>
            <div className="stat-value">1 284</div>
            <div className="stat-foot"><span className="change positive"><ArrowUpIcon /> 8,2%</span><span>к прошлому месяцу</span></div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span className="stat-label">Конверсия</span><span className="stat-icon conversion"><SparkIcon /></span></div>
            <div className="stat-value">3,64<span className="unit">%</span></div>
            <div className="stat-foot"><span className="change positive"><ArrowUpIcon /> 0,6%</span><span>к прошлому месяцу</span></div>
          </article>
          <article className="stat-card">
            <div className="stat-top"><span className="stat-label">Средний чек</span><span className="stat-icon average"><ReceiptIcon /></span></div>
            <div className="stat-value">₽ 2 217</div>
            <div className="stat-foot"><span className="change negative"><ArrowDownIcon /> 2,4%</span><span>к прошлому месяцу</span></div>
          </article>
        </section>

        <section className="chart-card" id="reports">
          <div className="chart-header">
            <div>
              <div className="chart-title-row"><h2>Динамика дохода</h2><span className="live-badge"><i /> ВЫРУЧКА</span></div>
              <p className="chart-description">Суммарный доход за выбранный период</p>
            </div>
            <div className="period-control" aria-label="Период графика">
              {['7 дней', '30 дней', '12 месяцев'].map((item) => <button key={item} className={period === item ? 'selected' : ''} onClick={() => setPeriod(item)}>{item}</button>)}
            </div>
          </div>
          <div className="chart-summary"><strong>₽ 2 846 390</strong><span className="change positive"><ArrowUpIcon /> 12,8%</span><span className="summary-caption">за {period.toLowerCase()}</span></div>
          <div className="chart-wrap">
            <svg className="line-chart" viewBox={`0 0 ${chart.width} ${chart.height}`} role="img" aria-label="Линейный график роста дохода с января по декабрь">
              <defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" className="gradient-start" /><stop offset="100%" className="gradient-end" /></linearGradient></defs>
              {[0, 25, 50, 75, 100].map((v) => <g key={v}><line className="grid-line" x1={chart.left} x2={chart.width - chart.right} y1={chart.y(v)} y2={chart.y(v)} /><text className="axis-label" x={chart.left - 12} y={chart.y(v) + 4} textAnchor="end">{v === 0 ? '0' : `${v}к`}</text></g>)}
              <path className="area-fill" d={chart.area} />
              <path className="chart-line" d={chart.line} />
              {values.map((value, i) => <g key={i} className="chart-point" onMouseEnter={() => setActivePoint(i)} onFocus={() => setActivePoint(i)} tabIndex={0} role="button" aria-label={`${months[i]}: ${value} тысяч рублей`}>
                {activePoint === i && <><line className="guide-line" x1={chart.x(i)} x2={chart.x(i)} y1={chart.top} y2={chart.height - chart.bottom} /><circle className="point-halo" cx={chart.x(i)} cy={chart.y(value)} r="8" /></>}
                <circle className={`point-dot ${activePoint === i ? 'point-active' : ''}`} cx={chart.x(i)} cy={chart.y(value)} r={activePoint === i ? 4.5 : 3} />
                <text className="month-label" x={chart.x(i)} y={chart.height - 7} textAnchor="middle">{months[i]}</text>
              </g>)}
              <g className="chart-tooltip" transform={`translate(${Math.min(chart.x(activePoint) - 40, chart.width - 112)}, ${Math.max(chart.y(values[activePoint]) - 47, 0)})`}>
                <rect width="92" height="30" rx="7" /><text x="46" y="19" textAnchor="middle">₽ {values[activePoint]} 000</text>
              </g>
            </svg>
          </div>
          <div className="chart-footer"><span><i className="legend-line" /> Доход</span><span className="updated">Последнее обновление: сегодня, 09:41</span></div>
        </section>

        <section className="bottom-row" id="audience">
          <article className="insight-card"><div className="insight-icon"><SparkIcon /></div><div><p className="insight-kicker">ИНСАЙТ НЕДЕЛИ</p><h3>Рост продолжается</h3><p className="insight-copy">Доход вырос на <b>12,8%</b> благодаря повторным покупкам.</p></div><span className="insight-arrow">↗</span></article>
          <article className="goal-card"><div className="goal-head"><div><p className="insight-kicker">ЦЕЛЬ НА МЕСЯЦ</p><h3>План по выручке</h3></div><span className="goal-percent">74%</span></div><div className="progress-track"><span /></div><div className="goal-foot"><span>₽ 2,8 млн из ₽ 3,8 млн</span><span>Осталось 9 дней</span></div></article>
        </section>
        <footer className="footer"><span>© 2026 Lumen Analytics</span><span className="footer-status"><i /> Все системы работают</span></footer>
      </div>
    </main>
  );
}

function MoonIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.2 15.3A8.5 8.5 0 0 1 8.7 3.8 8.7 8.7 0 1 0 20.2 15.3Z" /></svg>; }
function SunIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" /></svg>; }
function DownloadIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5v9m0 0 3.5-3.5M10 11.5 6.5 8M3 13.5v3h14v-3" /></svg>; }
function ArrowUpIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 12V4m0 0L4.5 7.5M8 4l3.5 3.5" /></svg>; }
function ArrowDownIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 4v8m0 0 3.5-3.5M8 12 4.5 8.5" /></svg>; }
function WalletIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="14" rx="3" /><path d="M3.5 9h17m-5.5 5h2" /><path d="M5.5 6V4.5a1.5 1.5 0 0 1 1.8-1.47L18 5" /></svg>; }
function UsersIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.25" /><path d="M3 20v-1.5a6 6 0 0 1 12 0V20zm13-12.5a3.25 3.25 0 0 1 0 6.3M18 14.5a4 4 0 0 1 3 3.9V20h-3" /></svg>; }
function SparkIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.9 6.1L20 10l-6.1 1.9L12 18l-1.9-6.1L4 10l6.1-1.9L12 2Z" /><path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" /></svg>; }
function ReceiptIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-3-2-3 2-3-2-3 2v-17Z" /><path d="M9 8h6m-6 4h6" /></svg>; }
