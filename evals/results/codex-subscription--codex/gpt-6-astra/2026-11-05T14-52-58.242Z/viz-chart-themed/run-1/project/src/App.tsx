import { useId, useState } from 'react';
import { Button, useThemeType } from '@gravity-ui/uikit';
import './App.css';

const values = [1240, 1420, 1360, 1680, 1590, 1460, 1810, 1950, 1730, 1860, 2130, 2010, 1820, 2230, 2460, 2290, 2510, 2340, 2120, 2390, 2740, 2580, 2810, 2630, 2930, 2760, 3120, 2980, 3260, 3480];
const previous = [1030, 1140, 1080, 1290, 1210, 1340, 1230, 1480, 1390, 1510, 1440, 1660, 1530, 1720, 1610, 1790, 1700, 1860, 1730, 1920, 1800, 2020, 1910, 2140, 2040, 2200, 2110, 2290, 2170, 2390];
const format = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

function ThemeIcon({ dark }: { dark: boolean }) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{dark ? <path d="M20.9 13a9 9 0 0 1-9.9-9.9A9 9 0 1 0 20.9 13Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}</svg>;
}

export function App({ onThemeChange }: { onThemeChange?: (theme: 'light' | 'dark') => void }) {
  const theme = useThemeType();
  const [period, setPeriod] = useState(30);
  const [comparison, setComparison] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);
  const gradientId = useId();
  const data = values.slice(-period);
  const comparisonData = previous.slice(-period);
  const total = data.reduce((a, b) => a + b, 0);
  const oldTotal = comparisonData.reduce((a, b) => a + b, 0);
  const growth = ((total / oldTotal - 1) * 100).toFixed(1).replace('.', ',');
  const x = (i: number) => 64 + i * 940 / (data.length - 1);
  const y = (v: number) => 292 - v / 4000 * 248;
  const path = (series: number[]) => series.map((v, i) => `${i ? 'L' : 'M'} ${x(i)} ${y(v)}`).join(' ');
  const date = (i: number) => `${31 - period + i} октября`;
  const ticks = [...new Set([0, Math.round((period - 1) / 4), Math.round((period - 1) / 2), Math.round((period - 1) * .75), period - 1])];

  return <div className="app-shell">
    <header className="app-header">
      <a className="brand" href="#" aria-label="Пульс — главная"><span className="brand-mark"><svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M2 13h5l3-7 4 13 3-8h5" /></svg></span>пульс<span className="brand-divider" /><span className="header-label">Аналитика</span></a>
      <div className="header-actions"><span className="workspace-name"><span className="status-dot" />Мой проект</span>{onThemeChange && <Button view="outlined" size="l" onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')} aria-label={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'} title={theme === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}><ThemeIcon dark={theme === 'dark'} /></Button>}<span className="avatar" aria-label="Мой проект">МП</span></div>
    </header>
    <main>
      <div className="breadcrumb">Мой проект <span>/</span> Обзор</div>
      <div className="page-heading"><div><div className="eyebrow">ВСЁ В ОДНОМ МЕСТЕ</div><h1>Обзор активности</h1><p>Наблюдайте за динамикой и замечайте важное.</p></div><span className="demo-badge"><span />Демонстрационные данные</span></div>
      <section className="chart-card" aria-labelledby="chart-heading">
        <div className="chart-heading"><div><h2 id="chart-heading">Посещаемость</h2><p>Как меняется число посещений вашего сайта</p></div><div className="period-selector" role="group" aria-label="Период графика">{[7, 14, 30].map(days => <button key={days} aria-pressed={period === days} className={period === days ? 'selected' : ''} onClick={() => { setPeriod(days); setActive(null); }}>{days} дней</button>)}</div></div>
        <div className="chart-summary"><div><div className="metric-label">Всего посещений</div><div className="metric-row"><strong>{format(total)}</strong><span className="growth">↗ {growth}%</span></div><div className="metric-caption">по сравнению с предыдущим периодом</div></div><div className="date-range"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4m10-4v4M3 11h18" /></svg>{31 - period}–30 октября 2026</div></div>
        <div className="chart-legend"><span><i className="legend-line current" />Текущий период</span><button onClick={() => setComparison(!comparison)} aria-pressed={comparison} className={comparison ? '' : 'muted'}><i className="legend-line previous" />Предыдущий период</button><span className="axis-caption">Посещения</span></div>
        <div className="chart-scroll"><div className="chart-container">
          <svg className="line-chart" viewBox="0 0 1040 342" role="group" aria-label={`Линейный график посещаемости за ${period} дней. Для просмотра значений выберите точку или откройте таблицу.`} onMouseLeave={() => setActive(null)}>
            <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-line)" stopOpacity=".12" /><stop offset="100%" stopColor="var(--chart-line)" stopOpacity="0" /></linearGradient></defs>
            {[0, 1000, 2000, 3000, 4000].map(v => <g key={v}><line x1="64" x2="1004" y1={y(v)} y2={y(v)} className="grid-line" strokeDasharray={v === 0 ? undefined : '3 5'} /><text x="46" y={y(v) + 4} textAnchor="end" className="axis-text">{format(v)}</text></g>)}
            {ticks.map(i => <text key={i} x={x(i)} y="325" textAnchor="middle" className="axis-text">{31 - period + i} окт.</text>)}
            <path d={`${path(data)} L 1004 292 L 64 292 Z`} fill={`url(#${gradientId})`} />
            {comparison && <path d={path(comparisonData)} className="comparison-path" />}
            <path d={path(data)} className="data-path" />
            {active !== null && <g pointerEvents="none"><line x1={x(active)} x2={x(active)} y1="44" y2="292" className="cursor-line" /><circle cx={x(active)} cy={y(data[active])} r="5" className="active-point" /></g>}
            {data.map((value, i) => <circle key={i} cx={x(i)} cy={y(value)} r="12" className="point-target" tabIndex={0} role="img" aria-label={`${date(i)}: ${format(value)} посещений${comparison ? `, предыдущий период: ${format(comparisonData[i])}` : ''}`} onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)} onClick={() => setActive(i)}><title>{date(i)}: {format(value)} посещений</title></circle>)}
          </svg>
          {active !== null && <div className="chart-tooltip" style={{ left: `${Math.min(80, Math.max(12, x(active) / 1040 * 100))}%`, top: `${Math.max(1, y(data[active]) / 342 * 100 - 29)}%` }}><strong>{date(active)} 2026</strong><div><span><i className="tooltip-dot" />Посещения</span><b>{format(data[active])}</b></div>{comparison && <div><span>Предыдущий период</span><b>{format(comparisonData[active])}</b></div>}</div>}
        </div></div>
        <div className="chart-footer"><span><span className="status-dot" />Данные за выбранный период</span><button onClick={() => setShowTable(!showTable)} aria-expanded={showTable} aria-controls="data-table">{showTable ? 'Скрыть таблицу' : 'Посмотреть данные'} <span aria-hidden="true">{showTable ? '↑' : '↗'}</span></button></div>
        {showTable && <div className="table-scroll" id="data-table"><table><caption>Посещения по дням — демонстрационные данные</caption><thead><tr><th scope="col">Дата</th><th scope="col">Текущий период</th>{comparison && <th scope="col">Предыдущий период</th>}</tr></thead><tbody>{data.map((v, i) => <tr key={i}><th scope="row">{date(i)} 2026</th><td>{format(v)}</td>{comparison && <td>{format(comparisonData[i])}</td>}</tr>)}</tbody></table></div>}
      </section>
      <div className="insight-row"><div className="insight-icon">↗</div><div><strong>Посещаемость растёт</strong><p>За последние {period} дней ваш сайт посетили на {growth}% чаще, чем за предыдущий период.</p></div></div>
      <footer className="page-footer"><span>Пульс · Каждый показатель имеет значение</span><span><ThemeIcon dark={theme === 'dark'} />{theme === 'dark' ? 'Тёмная' : 'Светлая'} тема</span></footer>
    </main>
  </div>;
}
