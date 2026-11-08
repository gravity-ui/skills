import {useMemo, useState, type ComponentProps} from 'react';
import {Chart} from '@gravity-ui/charts';
import {Button, SegmentedRadioGroup, Select, Switch, Text, useThemeValue} from '@gravity-ui/uikit';
import './App.css';

const visitors = [1820, 2050, 1980, 1720, 1890, 2380, 2510, 2290, 2460, 2780, 2540, 2240, 2430, 2820, 3080, 2890, 2710, 2960, 3320, 3110, 2850, 3010, 3540, 3260, 3090, 3460, 3820, 3590, 3370, 3780];
const newcomers = [1120, 1260, 1190, 1020, 1170, 1520, 1640, 1430, 1570, 1810, 1630, 1370, 1540, 1830, 2080, 1870, 1690, 1930, 2240, 2070, 1800, 1980, 2430, 2180, 2020, 2330, 2670, 2460, 2210, 2580];
const number = new Intl.NumberFormat('ru-RU');
const dayLabel = (day: number) => `${String(day).padStart(2, '0')} окт`;

type AppProps = {onThemeChange: () => void};

export function App({onThemeChange}: AppProps) {
  const theme = useThemeValue();
  const dark = theme.startsWith('dark');
  const [period, setPeriod] = useState('30');
  const [metric, setMetric] = useState('visitors');
  const [grouping, setGrouping] = useState('day');
  const [smooth, setSmooth] = useState(true);
  const [grid, setGrid] = useState(true);
  const [visible, setVisible] = useState([true, true]);
  const [exported, setExported] = useState(false);
  const start = 30 - Number(period);
  const rows = useMemo(() => visitors.slice(start).map((value, index) => ({
    day: start + index + 1,
    total: metric === 'visitors' ? value : Math.round(value * 1.43),
    new: metric === 'visitors' ? newcomers[start + index] : Math.round(newcomers[start + index] * 1.28),
  })), [start, metric]);
  const points = useMemo(() => {
    if (grouping === 'day') return rows;
    return Array.from({length: Math.ceil(rows.length / 7)}, (_, index) => {
      const week = rows.slice(index * 7, index * 7 + 7);
      return {day: week[0].day, total: week.reduce((s, r) => s + r.total, 0), new: week.reduce((s, r) => s + r.new, 0)};
    });
  }, [rows, grouping]);
  const total = rows.reduce((sum, row) => sum + row.total, 0);
  const newTotal = rows.reduce((sum, row) => sum + row.new, 0);
  const peak = rows.reduce((best, row) => row.total > best.total ? row : best, rows[0]);
  const growth = ((rows[rows.length - 1].total / rows[0].total - 1) * 100).toFixed(1).replace('.', ',');
  const peakGrowth = ((peak.total / rows[0].total - 1) * 100).toFixed(1).replace('.', ',');
  const seriesNames = metric === 'visitors' ? ['Посетители', 'Новые посетители'] : ['Сеансы', 'Сеансы новых посетителей'];
  const chartData: ComponentProps<typeof Chart>['data'] = {
    series: {data: [
      {type: 'line', name: seriesNames[0], color: 'var(--g-color-text-utility)', data: points.map(row => ({x: dayLabel(row.day), y: row.total})), lineWidth: 3, interpolation: {type: smooth ? 'monotone' : 'linear'}, marker: {enabled: false}},
      {type: 'line', name: seriesNames[1], color: 'var(--g-color-text-positive)', data: points.map(row => ({x: dayLabel(row.day), y: row.new})), lineWidth: 2.5, interpolation: {type: smooth ? 'monotone' : 'linear'}, marker: {enabled: false}},
    ].filter((_, index) => visible[index]) as ComponentProps<typeof Chart>['data']['series']['data']},
    xAxis: {type: 'category', categories: points.map(row => dayLabel(row.day)), grid: {enabled: false}, lineVisible: false, ticks: {values: points.map((_, i) => i).filter(i => grouping === 'week' || i % (period === '7' ? 1 : 4) === 0 || i === points.length - 1)}, labels: {autoRotation: false}},
    yAxis: [{type: 'linear', min: 0, grid: {enabled: grid}, lineVisible: false, ticks: {interval: 75}}],
    legend: {enabled: false},
    tooltip: {enabled: true},
  };

  function exportCsv() {
    const csv = '\uFEFF' + ['Дата;' + seriesNames.join(';'), ...points.map(row => `2026-10-${String(row.day).padStart(2, '0')};${row.total};${row.new}`)].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-october-${period}-${grouping}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="identity"><div className="brand-mark" aria-hidden="true"><i/><i/><i/><i/></div><span className="wordmark">pulse<span className="brand-dot">.</span></span><span className="header-divider"/><Text className="product-caption" color="secondary" variant="body-2">Веб-аналитика</Text></div>
          <div className="header-actions"><span className="theme-label">Тема интерфейса</span><div className="theme-buttons"><Button view={dark ? 'flat' : 'raised'} size="m" selected={!dark} onClick={() => dark && onThemeChange()} aria-label="Светлая тема" title="Светлая тема"><span className="theme-symbol">☼</span></Button><Button view={dark ? 'raised' : 'flat'} size="m" selected={dark} onClick={() => !dark && onThemeChange()} aria-label="Тёмная тема" title="Тёмная тема"><span className="theme-symbol">☾</span></Button></div><span className="header-divider"/><div className="avatar" aria-label="Рабочее пространство">P</div></div>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumbs"><span>Рабочее пространство</span><span className="crumb-slash">/</span><span>Обзор</span></div>
        <div className="page-heading"><div><div className="eyebrow">ОБЗОР ПОКАЗАТЕЛЕЙ</div><Text as="h1" variant="display-2" className="page-title">Трафик в деталях</Text><Text as="p" variant="body-2" color="secondary" className="subtitle">Следите за динамикой посещений и находите точки роста.</Text></div><Button size="l" view="outlined" onClick={exportCsv}><span className="download-arrow" aria-hidden="true">↓</span>{exported ? 'CSV скачан' : 'Экспорт данных'}</Button></div>
        <div className="page-toolbar"><div className="report-label"><span className="status-dot"/><Text variant="body-2">Посещаемость сайта</Text><span className="demo-badge">Демо-данные</span></div><div className="period-controls"><span className="date-range">{dayLabel(start + 1)} — 30 окт 2026</span><SegmentedRadioGroup aria-label="Период отчёта" value={period} onUpdate={setPeriod} size="m" options={[{value: '7', content: '7 дней'}, {value: '14', content: '14 дней'}, {value: '30', content: '30 дней'}]}/></div></div>
        <section className="stats" aria-label="Сводные показатели">
          <div className="stat-card"><div className="stat-label"><span className="stat-icon utility">↗</span><Text color="secondary" variant="body-2">{metric === 'visitors' ? 'Всего посещений' : 'Всего сеансов'}</Text></div><div className="stat-value"><Text variant="display-2">{number.format(total)}</Text><span className="stat-change">↗ {growth}%</span></div><Text variant="body-1" color="secondary">рост за выбранный период</Text></div>
          <div className="stat-card"><div className="stat-label"><span className="stat-icon positive">♧</span><Text color="secondary" variant="body-2">{metric === 'visitors' ? 'Новые посетители' : 'Сеансы новых посетителей'}</Text></div><div className="stat-value"><Text variant="display-2">{number.format(newTotal)}</Text><span className="neutral-badge">{Math.round(newTotal / total * 100)}% от всех</span></div><Text variant="body-1" color="secondary">первое знакомство с вашим сайтом</Text></div>
          <div className="stat-card"><div className="stat-label"><span className="stat-icon neutral">∿</span><Text color="secondary" variant="body-2">В среднем за день</Text></div><div className="stat-value"><Text variant="display-2">{number.format(Math.round(total / rows.length))}</Text><span className="neutral-badge">за {period} дней</span></div><Text variant="body-1" color="secondary">{metric === 'visitors' ? 'посещений в день' : 'сеансов в день'}</Text></div>
        </section>
        <section className="chart-card" aria-labelledby="chart-title">
          <div className="chart-heading"><div><Text as="h2" variant="header-1" id="chart-title">Динамика посещаемости</Text><Text as="p" color="secondary" variant="body-1">Как меняется интерес к вашему сайту</Text></div><div className="chart-controls"><Select aria-label="Метрика графика" value={[metric]} onUpdate={v => setMetric(v[0])} size="m" options={[{value: 'visitors', content: 'Посетители'}, {value: 'sessions', content: 'Сеансы'}]}/><Select aria-label="Группировка данных" value={[grouping]} onUpdate={v => setGrouping(v[0])} size="m" options={[{value: 'day', content: 'По дням'}, {value: 'week', content: 'По неделям'}]}/></div></div>
          <div className="chart-meta"><div className="legend">{seriesNames.map((name, index) => <Button key={index} view="flat" size="s" className={visible[index] ? 'legend-button' : 'legend-button is-hidden'} aria-pressed={visible[index]} onClick={() => setVisible(previous => previous.map((value, i) => i === index ? !value : value))}><span className={`legend-dot ${index ? 'positive' : 'utility'}`}/>{name}</Button>)}</div><Text color="hint" variant="caption-2">{grouping === 'day' ? 'Посещения за день' : 'Посещения за неделю'}</Text></div>
          <div className="chart-plot" role="region" aria-label={`Линейный график: ${seriesNames.filter((_, i) => visible[i]).join(', ')}. С ${start + 1} по 30 октября 2026 года.`}>{visible.some(Boolean) ? <Chart data={chartData}/> : <div className="empty-state"><Text variant="subheader-2">Выберите данные для отображения</Text><Text color="secondary">Нажмите на название ряда над графиком.</Text><Button view="outlined" onClick={() => setVisible([true, true])}>Показать все данные</Button></div>}</div>
          <div className="chart-footer"><div className="hint"><span className="info-circle">i</span>Наведите на график, чтобы увидеть точные значения</div><span className="theme-indicator"><span className="status-dot"/> {dark ? 'Тёмная' : 'Светлая'} тема</span></div>
        </section>
        <div className="bottom-panels"><section className="insight"><div className="insight-icon">↗</div><div><Text as="h3" variant="subheader-2">Ваш трафик растёт</Text><Text as="p" variant="body-1" color="secondary">Пик посещаемости — <strong>{dayLabel(peak.day)}ября</strong>: {number.format(peak.total)} {metric === 'visitors' ? 'посещений' : 'сеансов'}.<br/>На {peakGrowth}% больше, чем в первый день периода.</Text></div></section><section className="display-settings"><div><Text as="h3" variant="subheader-2">Отображение графика</Text><Text as="p" variant="body-1" color="secondary">Настройте удобный для вас вид</Text></div><div className="switches"><Switch checked={smooth} onUpdate={setSmooth}>Плавные линии</Switch><Switch checked={grid} onUpdate={setGrid}>Линии сетки</Switch></div></section></div>
        <footer className="page-footer"><span><span className="footer-brand">pulse.</span> Данные, которые помогают расти.</span><span>Демонстрационный отчёт · Октябрь 2026</span></footer>
        <div className="sr-only" aria-live="polite">{exported ? 'Данные экспортированы в CSV' : ''}</div>
      </main>
    </div>
  );
}
