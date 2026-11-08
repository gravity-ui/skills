import {useState, useId, type ReactNode} from 'react';
import {ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import './styles.css';

type IconName = 'chart' | 'grid' | 'sun' | 'moon' | 'chevron' | 'download' | 'arrow' | 'calendar' | 'check' | 'layers' | 'help' | 'close';
function Icon({name, size = 18}: {name: IconName; size?: number}) {
  const paths: Record<IconName, ReactNode> = {
    chart: <><path d="M4 4v16h16"/><path d="m7 14 4-5 4 3 5-7"/></>,
    grid: <><rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z"/>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 15v5h16v-5"/></>,
    arrow: <><path d="m6 16 12-10M8 6h10v10"/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16m-12 4h2m4 0h2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3v.2"/></>,
    close: <path d="m6 6 12 12M6 18 18 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
const revenue = [32,37,34,42,39,28,33,47,51,43,40,49,55,50,42,48,62,67,58,54,66,72,64,61,76,70,68,80,75,86];
const previous = [24,29,27,32,28,22,27,34,37,32,30,37,41,36,33,38,46,43,39,42,47,51,45,48,53,49,52,59,54,62];
const format = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
const metrics = ['Выручка', 'Заказы', 'Средний чек'];
function smoothPath(points: [number, number][]) {
  return points.reduce((path, point, i) => {
    if (!i) return `M ${point[0]} ${point[1]}`;
    const prev = points[i - 1];
    const middle = (prev[0] + point[0]) / 2;
    return `${path} C ${middle} ${prev[1]}, ${middle} ${point[1]}, ${point[0]} ${point[1]}`;
  }, '');
}
export function App() {
  const [theme, setTheme] = useState<'light' | 'dark' | undefined>(undefined);
  return <ThemeProvider theme={theme}><Dashboard onThemeChange={setTheme}/></ThemeProvider>;
}
function Dashboard({onThemeChange}: {onThemeChange: (theme: 'light' | 'dark') => void}) {
  const theme = useThemeType();
  const [period, setPeriod] = useState(30);
  const [metric, setMetric] = useState(0);
  const [view, setView] = useState('overview');
  const [compare, setCompare] = useState(true);
  const [currentVisible, setCurrentVisible] = useState(true);
  const [hovered, setHovered] = useState<number | null>(null);
  const [help, setHelp] = useState(false);
  const [exported, setExported] = useState(false);
  const gradientId = useId();
  const start = period === 7 ? 23 : period === 90 ? 0 : 0;
  const count = period;
  const sourceRevenue = period === 90 ? Array.from({length: 90}, (_, i) => Math.round(revenue[i % 30] * (0.62 + Math.floor(i / 30) * 0.19))) : revenue;
  const sourcePrevious = period === 90 ? Array.from({length: 90}, (_, i) => Math.round(previous[i % 30] * (0.62 + Math.floor(i / 30) * 0.19))) : previous;
  const values = sourceRevenue.slice(start, start + count).map((n, i) => metric === 1 ? Math.round(n * 1.8) : metric === 2 ? Math.round(3000 + n * 11 + Math.sin(i) * 120) : n * 1000);
  const oldValues = sourcePrevious.slice(start, start + count).map((n, i) => metric === 1 ? Math.round(n * 1.8) : metric === 2 ? Math.round(2900 + n * 11 + Math.sin(i) * 120) : n * 1000);
  const max = metric === 0 ? 100000 : metric === 1 ? 200 : 5000;
  const xs = (i: number) => 58 + i / (values.length - 1) * 962;
  const ys = (v: number) => 290 - v / max * 250;
  const points: [number, number][] = values.map((v, i) => [xs(i), ys(v)]);
  const line = smoothPath(points);
  const oldLine = smoothPath(oldValues.map((v, i) => [xs(i), ys(v)]));
  const dateAt = (i: number) => {
    const date = period === 90 ? new Date(2025, 0, 31 + i) : new Date(2025, 3, start + i + 1);
    return date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}).replace('.', '');
  };
  const dateRange = period === 7 ? '24–30 апреля 2025' : period === 90 ? '31 января – 30 апреля 2025' : '1–30 апреля 2025';
  const total = values.reduce((a, b) => a + b, 0);
  const oldTotal = oldValues.reduce((a, b) => a + b, 0);
  const growth = ((total / oldTotal - 1) * 100).toFixed(1).replace('.', ',');
  const exportData = () => {
    const csv = '\uFEFFДата;'+ metrics[metric] +';Предыдущий период\n' + values.map((v, i) => `${dateAt(i)};${v};${oldValues[i]}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a'); link.href = url; link.download = 'pulse-analytics.csv'; link.click(); URL.revokeObjectURL(url);
    setExported(true); setTimeout(() => setExported(false), 2500);
  };
  return <div className="app-shell" data-theme={theme}>
    <aside className="sidebar">
      <a href="#" className="brand" aria-label="Pulse — главная" onClick={() => setView('overview')}><span className="brand-mark"><svg viewBox="0 0 28 28" fill="none"><path d="M3 15h5l3-8 5 15 3-10 3 3h3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"/></svg></span><span>pulse<span className="brand-dot">.</span></span></a>
      <div className="workspace"><span className="workspace-logo">S</span><div><strong>Studio workspace</strong><span>Личное пространство</span></div><Icon name="chevron" size={16}/></div>
      <div className="nav-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
      <nav><button className={view === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => setView('overview')}><Icon name="chart"/>Обзор<span className="nav-active-dot"/></button><button className={view === 'data' ? 'nav-item active' : 'nav-item'} onClick={() => setView('data')}><Icon name="layers"/>Данные</button></nav>
      <div className="sidebar-bottom"><div className="theme-card"><span>Внешний вид</span><div className="theme-switch"><button className={theme === 'light' ? 'selected' : ''} onClick={() => onThemeChange('light')} aria-pressed={theme === 'light'}><Icon name="sun" size={16}/>Светлая</button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => onThemeChange('dark')} aria-pressed={theme === 'dark'}><Icon name="moon" size={16}/>Тёмная</button></div></div><button className="nav-item help-button" onClick={() => setHelp(true)}><Icon name="help"/>Помощь и поддержка<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 17 17 7M7 7h10v10"/></svg></button><div className="profile"><span className="avatar">АК</span><div><strong>Александр</strong><span>Личный аккаунт</span></div><span className="profile-dot"/></div></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><Icon name="grid" size={16}/><span>Рабочее пространство</span><span className="slash">/</span><strong>{view === 'overview' ? 'Обзор' : 'Данные'}</strong></div><div className="topbar-right"><span className="demo-badge"><span/>Демо-данные</span><button className="icon-button mobile-theme" aria-label="Переключить тему" onClick={() => onThemeChange(theme === 'light' ? 'dark' : 'light')}><Icon name={theme === 'light' ? 'moon' : 'sun'}/></button><span className="avatar small">АК</span></div></header>
      <main><div className="page-heading"><div><div className="eyebrow">ВАША АНАЛИТИКА, В ДЕТАЛЯХ</div><h1>{view === 'overview' ? 'Обзор показателей' : 'Данные показателей'}</h1><p>Следите за динамикой и находите новые точки роста.</p></div><button className="button export-button" onClick={exportData}><Icon name={exported ? 'check' : 'download'} size={17}/>{exported ? 'Готово' : 'Экспорт'}</button></div>
      <div className="filter-row"><div className="period-tabs" aria-label="Период">{[7,30,90].map(days => <button key={days} className={period === days ? 'selected' : ''} onClick={() => {setPeriod(days); setHovered(null);}} aria-pressed={period === days}>{days} дней</button>)}</div><div className="date-range"><Icon name="calendar" size={16}/>{dateRange}</div></div>
      <section className="stats" aria-label="Основные показатели">{metrics.map((name, i) => {
        const current = sourceRevenue.slice(start, start + count); const old = sourcePrevious.slice(start, start + count);
        const sum = current.reduce((a,b) => a+b,0); const oldSum = old.reduce((a,b) => a+b,0);
        const value = i === 0 ? `${format(sum * 1000)} ₽` : i === 1 ? format(Math.round(sum * 1.8)) : `${format(Math.round(3000 + sum / count * 11))} ₽`;
        const pct = i === 2 ? '5,8' : (100 * (sum / oldSum - 1)).toFixed(1).replace('.', ',');
        return <button key={name} className={`stat-card ${metric === i ? 'chosen' : ''}`} onClick={() => {setMetric(i); setHovered(null);}} aria-pressed={metric === i}><div className="stat-top"><span>{name}</span><span className={`stat-icon stat-icon-${i}`}><Icon name={i === 0 ? 'chart' : i === 1 ? 'layers' : 'grid'} size={17}/></span></div><div className="stat-value">{value}</div><div className="stat-bottom"><span className="growth"><Icon name="arrow" size={12}/>{pct}%</span><span>к предыдущему периоду</span><svg className="sparkline" viewBox="0 0 90 28"><path d={i === 1 ? 'M1 25 10 18 18 21 27 12 36 16 45 8 54 13 63 5 73 10 89 2' : i === 2 ? 'M1 24 10 22 18 25 27 16 36 18 45 10 54 14 63 6 73 8 89 2' : 'M1 24 10 20 18 22 27 13 36 16 45 7 54 11 63 3 73 7 89 1'} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div></button>;
      })}</section>
      <section className="chart-card"><div className="chart-heading"><div><h2>Динамика {metric === 0 ? 'выручки' : metric === 1 ? 'заказов' : 'среднего чека'}</h2><p>Ежедневные показатели за выбранный период</p></div><label className="metric-select"><select value={metric} onChange={e => {setMetric(Number(e.target.value)); setHovered(null);}} aria-label="Показатель">{metrics.map((m,i) => <option key={m} value={i}>{m}</option>)}</select><Icon name="chevron" size={15}/></label></div>
      <div className="chart-controls"><div className="legends"><button className={!currentVisible ? 'muted' : ''} onClick={() => setCurrentVisible(!currentVisible)} aria-pressed={currentVisible}><span className="legend-line current"/>Текущий период</button><button className={!compare ? 'muted' : ''} onClick={() => setCompare(!compare)} aria-pressed={compare}><span className="legend-line previous"/>Предыдущий период</button></div><span className="unit">{metric === 1 ? 'Количество заказов' : 'Сумма, ₽'}</span></div>
      {view === 'overview' ? <div className="chart-wrap"><svg className="main-chart" viewBox="0 0 1040 340" role="img" aria-label={`Линейный график: ${metrics[metric]}, ${dateRange}`} onMouseLeave={() => setHovered(null)}><defs><linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".14"/><stop offset="100%" stopColor="var(--accent)" stopOpacity=".005"/></linearGradient></defs>{[0,1,2,3,4].map(i => <g key={i}><line x1="58" x2="1020" y1={40 + i * 62.5} y2={40 + i * 62.5} className="grid-line"/><text x="42" y={44 + i * 62.5} textAnchor="end" className="axis-label">{metric === 0 ? `${100-i*25} тыс.` : format(max * (1-i/4))}</text></g>)}{Array.from({length: 7}, (_,j) => Math.round(j * (count - 1) / 6)).map(i => <text key={i} x={xs(i)} y="324" textAnchor={i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle'} className="axis-label">{dateAt(i)}</text>)}{currentVisible && <path d={`${line} L 1020 290 L 58 290 Z`} fill={`url(#${gradientId})`}/ >}{compare && <path d={oldLine} className="previous-path"/>}{currentVisible && <path d={line} className="current-path"/>}{hovered !== null && <g><line x1={xs(hovered)} x2={xs(hovered)} y1="26" y2="290" className="hover-line"/>{currentVisible && <circle cx={xs(hovered)} cy={ys(values[hovered])} r="5" className="chart-point"/>}{compare && <circle cx={xs(hovered)} cy={ys(oldValues[hovered])} r="4" className="old-point"/>}</g>}{values.map((v,i) => <rect key={i} x={xs(i)-962/(count-1)/2} y="20" width={962/(count-1)} height="280" fill="transparent" tabIndex={0} role="button" aria-label={`${dateAt(i)}: ${format(v)}${metric === 1 ? ' заказов' : ' рублей'}`} onMouseEnter={() => setHovered(i)} onFocus={() => setHovered(i)} onBlur={() => setHovered(null)}/>)}</svg>{hovered !== null && <div className="chart-tooltip" style={{left: `${Math.min(76, Math.max(8, xs(hovered)/1040*100))}%`}}><strong>{dateAt(hovered)} 2025</strong>{currentVisible && <span><i/>{format(values[hovered])}{metric !== 1 && ' ₽'}</span>}{compare && <span><i className="old"/>{format(oldValues[hovered])}{metric !== 1 && ' ₽'} <small>ранее</small></span>}</div>}</div> : <div className="table-scroll"><table><thead><tr><th>Дата</th><th>{metrics[metric]}</th><th>Предыдущий период</th><th>Изменение</th></tr></thead><tbody>{values.map((v,i) => <tr key={i}><td>{dateAt(i)} 2025</td><td>{format(v)}{metric !== 1 && ' ₽'}</td><td>{format(oldValues[i])}{metric !== 1 && ' ₽'}</td><td className="positive">+{((v/oldValues[i]-1)*100).toFixed(1)}%</td></tr>)}</tbody></table></div>}
      <div className="chart-footer"><span><span className="live-dot"/>Данные за {dateRange.toLowerCase()}</span><span>{values.length} точек на графике <span className="footer-dot">·</span> Шаг: 1 день</span></div></section>
      <section className="insight"><span className="insight-icon"><Icon name="arrow" size={22}/></span><div><h3>Хороший темп роста</h3><p>{metrics[metric]} {metric === 0 ? 'выросла' : metric === 1 ? 'выросли' : 'вырос'} на <strong>{growth}%</strong> по сравнению с предыдущим периодом. Продолжайте в том же духе.</p></div><span className="insight-badge">Положительная динамика</span></section>
      <footer className="page-footer"><span>Меньше шума. Больше ясности.</span><span><Icon name={theme === 'light' ? 'sun' : 'moon'} size={14}/>График адаптирован к {theme === 'light' ? 'светлой' : 'тёмной'} теме</span></footer>
      </main>
    </div>
    {help && <div className="modal-backdrop" onClick={() => setHelp(false)}><section className="help-modal" role="dialog" aria-modal="true" aria-label="Помощь" onClick={e => e.stopPropagation()}><button className="icon-button modal-close" onClick={() => setHelp(false)} aria-label="Закрыть"><Icon name="close"/></button><span className="brand-mark"><Icon name="help" size={24}/></span><h2>Всё о вашей аналитике</h2><p>Выберите показатель и период. Наведите курсор на график или используйте Tab, чтобы увидеть значения.</p><p>Нажмите на легенду, чтобы скрыть или показать линию. Во вкладке «Данные» доступны все значения, а кнопка «Экспорт» сохраняет их в CSV.</p><p>Переключатель «Внешний вид» меняет тему всего приложения, включая график. Представленные данные — демонстрационные.</p><button className="button primary" onClick={() => setHelp(false)}>Всё понятно</button></section></div>}
  </div>;
}
