import {useEffect, useId, useMemo, useRef, useState} from 'react';
import {ThemeProvider, useThemeType, type Theme} from '@gravity-ui/uikit';
import './styles.css';

type IconName = 'pulse' | 'sun' | 'moon' | 'arrow' | 'download' | 'calendar' | 'chevron' | 'users' | 'eye' | 'clock' | 'info' | 'check';
function Icon({name, size = 18}: {name: IconName; size?: number}) {
  const paths: Record<IconName, React.ReactNode> = {
    pulse: <path d="M2 12h4l3-8 5 16 3-8h5"/>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z"/>,
    arrow: <path d="M5 17 17 5M5 5h12v12"/>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v4h16v-4"/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16"/></>,
    chevron: <path d="m8 10 4 4 4-4"/>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5"/></>,
    eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v.1"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

const source = [1420, 1580, 1490, 1820, 1680, 1550, 1890, 2240, 2010, 2130, 1960, 2370, 2580, 2290, 2470, 2840, 2610, 2730, 2490, 2810, 3170, 2910, 3070, 3350, 3120, 3490, 3270, 3620, 3450, 3810];
const format = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
const dateLabel = (date: Date) => date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short'}).replace('.', '');
function makeData(days: number) {
  return Array.from({length: days}, (_, i) => {
    const date = new Date(2026, 9, 28 - days + 1 + i);
    const value = days === 30 ? source[i] : Math.round(1300 + (i / (days - 1)) * 2200 + Math.sin(i * 1.8) * 270 + Math.cos(i * .7) * 150);
    const previous = Math.round(value * (.72 + Math.sin(i * .8) * .1));
    return {date, value, previous};
  });
}
function smoothPath(points: number[][]) {
  return points.map((point, i) => {
    if (!i) return `M ${point[0]},${point[1]}`;
    const before = points[Math.max(0, i - 2)];
    const start = points[i - 1];
    const after = points[Math.min(points.length - 1, i + 1)];
    return `C ${start[0] + (point[0] - before[0]) / 6},${start[1] + (point[1] - before[1]) / 6} ${point[0] - (after[0] - start[0]) / 6},${point[1] - (after[1] - start[1]) / 6} ${point[0]},${point[1]}`;
  }).join(' ');
}

function Dashboard({setTheme}: {setTheme: (theme: Theme) => void}) {
  const theme = useThemeType();
  const [days, setDays] = useState(30);
  const [comparison, setComparison] = useState(true);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState<number | null>(null);
  const [exported, setExported] = useState(false);
  const gradientId = useId();
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(1120);
  useEffect(() => {
    if (!chartRef.current) return;
    const observer = new ResizeObserver(([entry]) => setChartWidth(Math.max(280, entry.contentRect.width)));
    observer.observe(chartRef.current);
    return () => observer.disconnect();
  }, []);
  const plotWidth = chartWidth - 78;
  const tickCount = chartWidth < 500 ? 4 : 7;
  const data = useMemo(() => makeData(days), [days]);
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const previousTotal = data.reduce((sum, item) => sum + item.previous, 0);
  const growth = ((total / previousTotal - 1) * 100).toFixed(1).replace('.', ',');
  const average = Math.round(total / days);
  const peak = data.reduce((best, item) => item.value > best.value ? item : best);
  const range = `${dateLabel(data[0].date)} — ${dateLabel(data[days - 1].date)} 2026`;
  const x = (i: number) => 54 + i / (data.length - 1) * plotWidth;
  const y = (value: number) => 282 - value / 5000 * 250;
  const points = data.map((item, i) => [x(i), y(item.value)]);
  const line = smoothPath(points);
  const previousLine = smoothPath(data.map((item, i) => [x(i), y(item.previous)]));
  const selected = active === null ? null : data[active];

  function exportData() {
    const csv = '\uFEFFДата;Посетители;Предыдущий период\n' + data.map(item => `${item.date.toLocaleDateString('ru-RU')};${item.value};${item.previous}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-visitors-${days}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }

  return <div className="app" data-theme={theme}>
    <header className="header">
      <div className="header-inner">
        <a href="#" className="brand" aria-label="Пульс — главная"><span className="brand-symbol"><Icon name="pulse" size={23}/></span>пульс<span className="brand-dot">.</span></a>
        <div className="header-divider"/>
        <span className="workspace-name">Веб-аналитика</span>
        <div className="header-right">
          <span className="live-status"><span/>Все системы работают</span>
          <div className="theme-switch" role="group" aria-label="Тема приложения">
            <button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')} aria-label="Светлая тема" aria-pressed={theme === 'light'} title="Светлая тема"><Icon name="sun" size={17}/></button>
            <button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')} aria-label="Тёмная тема" aria-pressed={theme === 'dark'} title="Тёмная тема"><Icon name="moon" size={16}/></button>
          </div>
          <div className="avatar" title="Личный кабинет">АК</div>
        </div>
      </div>
    </header>

    <main>
      <div className="breadcrumb">Рабочее пространство<span>/</span><span>Аналитика</span></div>
      <div className="page-heading">
        <div><div className="eyebrow"><span/>АНАЛИТИКА САЙТА</div><h1>Всё начинается с данных<span>.</span></h1><p>Следите за аудиторией и находите возможности для роста.</p></div>
        <button className="button export-button" onClick={exportData}><Icon name={exported ? 'check' : 'download'} size={16}/>{exported ? 'Файл скачан' : 'Экспорт данных'}</button>
      </div>

      <div className="overview-label"><h2>Обзор посещаемости</h2><span><Icon name="calendar" size={14}/>{range}</span></div>
      <section className="metrics" aria-label="Основные показатели">
        <article className="metric primary-metric">
          <div className="metric-top"><span>Посетители</span><span className="metric-icon"><Icon name="users"/></span></div>
          <div className="metric-value">{format(total)}<span className="growth"><Icon name="arrow" size={12}/> {growth}%</span></div>
          <div className="metric-bottom"><span>по сравнению с прошлым периодом</span><MiniChart values={source} /></div>
        </article>
        <article className="metric">
          <div className="metric-top"><span>В среднем за день</span><span className="metric-icon"><Icon name="eye"/></span></div>
          <div className="metric-value">{format(average)}<span className="metric-unit">посетителя</span></div>
          <div className="metric-bottom"><span>Стабильный интерес к вашему сайту</span><MiniChart values={source.slice().reverse()} muted/></div>
        </article>
        <article className="metric">
          <div className="metric-top"><span>Пик посещаемости</span><span className="metric-icon"><Icon name="pulse"/></span></div>
          <div className="metric-value">{format(peak.value)}<span className="metric-unit">за день</span></div>
          <div className="metric-bottom"><span><span className="small-dot"/>{dateLabel(peak.date)} 2026 · лучший результат</span><MiniChart values={[1, 2, 1, 3, 2, 4, 3, 4, 7, 5, 8, 10]} muted/></div>
        </article>
      </section>

      <section className="chart-card" aria-labelledby="chart-title">
        <div className="chart-heading"><div><h2 id="chart-title">Динамика посещаемости <span className="info-icon" title="Количество уникальных посетителей за каждый день"><Icon name="info" size={15}/></span></h2><p>Как меняется ваша аудитория с течением времени</p></div>
          <div className="period-switch" role="group" aria-label="Период графика">{[{days: 7, label: '7 дней'}, {days: 30, label: '30 дней'}, {days: 90, label: '90 дней'}].map(period => <button key={period.days} className={days === period.days ? 'selected' : ''} aria-pressed={days === period.days} onClick={() => {setDays(period.days); setActive(null);}}>{period.label}</button>)}</div>
        </div>
        <div className="chart-options"><div className="legend"><button aria-pressed={visible} className={!visible ? 'disabled-series' : ''} onClick={() => setVisible(!visible)}><span className="legend-line"/>Посетители</button>{comparison && <span className="previous-legend"><span className="legend-line dashed"/>Предыдущий период</span>}</div>
          <label className="compare-option"><input type="checkbox" checked={comparison} onChange={event => setComparison(event.target.checked)}/><span className="checkbox"><Icon name="check" size={11}/></span>Сравнить с прошлым периодом</label>
        </div>
        <div className="chart-area" ref={chartRef}>
          <div className="axis-title">Посетители</div>
          <svg className="line-chart" viewBox={`0 0 ${chartWidth} 330`} role="img" aria-label={`Линейный график посещаемости за ${days} дней. Всего ${format(total)} посетителей. Используйте стрелки для просмотра значений.`} tabIndex={0} onMouseLeave={() => setActive(null)} onKeyDown={event => {
            if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {event.preventDefault(); setActive(old => Math.max(0, Math.min(days - 1, (old ?? -1) + (event.key === 'ArrowRight' ? 1 : -1))));}
            if (event.key === 'Escape') setActive(null);
          }} onBlur={() => setActive(null)}>
            <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--accent)" stopOpacity=".14"/><stop offset="100%" stopColor="var(--accent)" stopOpacity=".005"/></linearGradient></defs>
            {[0, 1000, 2000, 3000, 4000, 5000].map(value => <g key={value}><line x1="54" x2={chartWidth - 24} y1={y(value)} y2={y(value)} stroke="var(--grid)" strokeDasharray="3 5"/><text x="42" y={y(value) + 4} textAnchor="end" className="axis-label">{format(value)}</text></g>)}
            {visible && <path d={`${line} L ${chartWidth - 24},282 L 54,282 Z`} fill={`url(#${gradientId})`}/>}
            {comparison && <path d={previousLine} fill="none" stroke="var(--previous-line)" strokeWidth="2" strokeDasharray="5 6" strokeLinecap="round"/>}
            {visible && <path d={line} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>}
            {Array.from({length: tickCount}, (_, i) => Math.round(i * (days - 1) / (tickCount - 1))).map(i => <text key={i} x={x(i)} y="316" textAnchor="middle" className="axis-label">{dateLabel(data[i].date)}</text>)}
            {active !== null && <g><line x1={x(active)} x2={x(active)} y1="28" y2="282" stroke="var(--previous-line)" strokeDasharray="4 4"/>{visible && <circle cx={x(active)} cy={y(data[active].value)} r="5" fill="var(--accent)" stroke="var(--surface)" strokeWidth="3"/>}{comparison && <circle cx={x(active)} cy={y(data[active].previous)} r="4" fill="var(--previous-line)" stroke="var(--surface)" strokeWidth="2"/>}</g>}
            {data.map((item, i) => <rect key={i} x={x(i) - plotWidth / 2 / (days - 1)} y="20" width={plotWidth / (days - 1)} height="270" fill="transparent" onMouseEnter={() => setActive(i)} onTouchStart={() => setActive(i)}><title>{dateLabel(item.date)}: {format(item.value)} посетителей</title></rect>)}
          </svg>
          {selected && active !== null && <div className="chart-tooltip" role="status" style={{left: `${Math.min(79, Math.max(9, x(active) / chartWidth * 100))}%`}}><strong>{dateLabel(selected.date)} 2026</strong>{visible && <div><span><i/>Посетители</span><b>{format(selected.value)}</b></div>}{comparison && <div><span><i className="previous-dot"/>Прошлый период</span><b>{format(selected.previous)}</b></div>}</div>}
        </div>
        <div className="chart-footer"><span><Icon name="clock" size={14}/> Данные по дням · UTC+0</span><span className="data-status"><span/>Данные актуальны</span></div>
      </section>

      <aside className="insight"><span className="insight-icon"><Icon name="arrow" size={19}/></span><div><strong>Ваша аудитория растёт</strong><p>За выбранный период сайт посетили на <b>{growth}%</b> больше пользователей. Так держать!</p></div><span className="insight-tag">Хорошая динамика</span></aside>
      <footer className="page-footer"><span>пульс<span className="footer-dot">.</span><span className="footer-caption">Чёткие данные. Верные решения.</span></span><span>С заботой о ваших данных <span className="footer-spark">✧</span></span></footer>
    </main>
  </div>;
}

function MiniChart({values, muted = false}: {values: number[]; muted?: boolean}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  return <svg className={`mini-chart ${muted ? 'muted' : ''}`} width="90" height="30" viewBox="0 0 90 30" aria-hidden="true"><path d={smoothPath(values.map((value, i) => [i / (values.length - 1) * 90, 26 - (value - min) / (max - min) * 22]))} fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>;
}

export function App() {
  const [theme, setTheme] = useState<Theme>();
  return <ThemeProvider theme={theme}><Dashboard setTheme={setTheme}/></ThemeProvider>;
}
