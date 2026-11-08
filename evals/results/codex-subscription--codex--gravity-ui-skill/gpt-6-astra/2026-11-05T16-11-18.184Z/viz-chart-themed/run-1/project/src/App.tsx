import {useMemo, useState} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Button, SegmentedRadioGroup, Select, Switch, Text, useThemeValue} from '@gravity-ui/uikit';
import './App.css';

const values = [1240, 1380, 1290, 1560, 1480, 1190, 1080, 1430, 1620, 1540, 1820, 1680, 1320, 1440, 1760, 1950, 1840, 2160, 1980, 1580, 1730, 2090, 2240, 2120, 2460, 2290, 1890, 2160, 2530, 2680];
const previous = [1120, 1250, 1180, 1390, 1320, 1020, 970, 1280, 1410, 1370, 1540, 1490, 1190, 1260, 1450, 1610, 1530, 1740, 1680, 1410, 1480, 1750, 1820, 1690, 1940, 1820, 1590, 1760, 2010, 2130];
const number = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
const metricNames: Record<string, string> = {visitors: 'Посетители', sessions: 'Визиты', views: 'Просмотры'};
const metricFactors: Record<string, number> = {visitors: 1, sessions: 1.34, views: 2.76};

function Mark({kind}: {kind: 'sun' | 'moon' | 'download' | 'calendar' | 'chart' | 'arrow' | 'info'}) {
  const paths = {
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></>,
    moon: <path d="M20.6 13.1A8.6 8.6 0 0 1 10.9 3.4 8.7 8.7 0 1 0 20.6 13.1Z"/>,
    download: <><path d="M12 3v12m-4-4 4 4 4-4M4 16v5h16v-5"/></>,
    calendar: <><rect x="4" y="5" width="16" height="16" rx="3"/><path d="M8 3v4m8-4v4M4 11h16m-11 4h2m2 0h2"/></>,
    chart: <><path d="M4 4v16h17M8 14l4-5 4 3 5-7"/></>,
    arrow: <><path d="M5 17 19 3M8 3h11v11"/></>,
    info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-10v1"/></>,
  };
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind]}</svg>;
}

export function App({onToggleTheme}: {onToggleTheme: () => void}) {
  const theme = useThemeValue();
  const dark = theme.startsWith('dark');
  const [period, setPeriod] = useState('30');
  const [metric, setMetric] = useState('visitors');
  const [compare, setCompare] = useState(true);
  const [group, setGroup] = useState('day');
  const [exported, setExported] = useState(false);
  const days = Number(period);
  const rows = useMemo(() => Array.from({length: days}, (_, i) => {
    const offset = 30 - days + i;
    const date = new Date(Date.UTC(2026, 5, offset + 1));
    const index = ((offset % 30) + 30) % 30;
    const factor = offset < 0 ? 0.8 : 1;
    return {date, current: Math.round(values[index] * factor * metricFactors[metric]), previous: Math.round(previous[index] * factor * metricFactors[metric])};
  }), [days, metric]);
  const total = rows.reduce((s, row) => s + row.current, 0);
  const previousTotal = rows.reduce((s, row) => s + row.previous, 0);
  const growth = ((total / previousTotal - 1) * 100).toLocaleString('ru-RU', {maximumFractionDigits: 1});
  const average = Math.round(total / days);
  const peak = rows.reduce((a, b) => a.current > b.current ? a : b);
  const dateLabel = (date: Date) => date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'}).replace('.', '');
  const dateRange = `${dateLabel(rows[0].date)} — ${dateLabel(rows[rows.length - 1].date)} 2026`;
  const points = useMemo(() => {
    if (group === 'day') return rows;
    return Array.from({length: Math.ceil(rows.length / 7)}, (_, i) => {
      const chunk = rows.slice(i * 7, i * 7 + 7);
      return {date: chunk[0].date, current: chunk.reduce((s, row) => s + row.current, 0), previous: chunk.reduce((s, row) => s + row.previous, 0)};
    });
  }, [rows, group]);
  const data: ChartData = {
    chart: {margin: {top: 24, right: 16, bottom: 12, left: 12}},
    legend: {enabled: false},
    xAxis: {type: 'category', categories: points.map(row => dateLabel(row.date)), grid: {enabled: false}, lineVisible: false, labels: {autoRotation: false}, ticks: {values: points.map((_, i) => i).filter(i => i % Math.max(1, Math.floor(points.length / 8)) === 0 || i === points.length - 1)}},
    yAxis: [{min: 0, grid: {enabled: true}, lineVisible: false, ticks: {interval: 70}, labels: {numberFormat: {precision: 0}}}],
    series: {data: [
      ...(compare ? [{type: 'line' as const, name: 'Предыдущий период', data: points.map((row, x) => ({x, y: row.previous})), color: 'var(--g-color-text-hint)', dashStyle: 'Dash' as const, lineWidth: 2, interpolation: {type: 'monotone' as const}}] : []),
      {type: 'line', name: metricNames[metric], data: points.map((row, x) => ({x, y: row.current})), color: 'var(--g-color-text-positive)', lineWidth: 3, interpolation: {type: 'monotone'}, marker: {enabled: false}},
    ]},
    tooltip: {valueFormat: {type: 'number', precision: 0}},
  };
  function exportCsv() {
    const csv = '\uFEFFДата;' + metricNames[metric] + (compare ? ';Предыдущий период' : '') + '\n' + points.map(row => `${row.date.toISOString().slice(0, 10)};${row.current}${compare ? `;${row.previous}` : ''}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = `pulse-${metric}-${period}-${group}.csv`; link.click();
    URL.revokeObjectURL(url); setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="header-inner">
          <a href="./" className="brand" aria-label="Pulse — главная"><span className="brand-mark"><i/><i/><i/><i/></span>pulse<span className="brand-period">.</span></a>
          <span className="header-divider"/>
          <Text variant="body-2" color="secondary">Аналитика</Text>
          <div className="header-right"><span className="demo-badge"><span/>Демо-проект</span><span className="header-divider"/><Button view="flat" size="l" onClick={onToggleTheme} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} title="Переключить тему"><Mark kind={dark ? 'moon' : 'sun'}/><span className="theme-label">{dark ? 'Тёмная тема' : 'Светлая тема'}</span></Button><span className="avatar">АК</span></div>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumb">Рабочее пространство <span>/</span> <span>Обзор</span></div>
        <div className="page-heading"><div><div className="eyebrow">ВАШИ ДАННЫЕ. ЯСНАЯ КАРТИНА.</div><Text variant="display-1" as="h1">Обзор посещаемости</Text><Text variant="body-2" color="secondary" as="p">Следите за динамикой и замечайте то, что действительно важно.</Text></div><Button view="outlined" size="l" onClick={exportCsv}><Mark kind="download"/>{exported ? 'CSV скачан' : 'Экспорт данных'}</Button></div>
        <div className="period-bar"><div className="period-left"><Text variant="body-2" color="secondary">Период</Text><SegmentedRadioGroup value={period} onUpdate={setPeriod} size="l" aria-label="Период отчёта" options={[{value: '7', content: '7 дней'}, {value: '30', content: '30 дней'}, {value: '90', content: '90 дней'}]}/></div><div className="date-range"><Mark kind="calendar"/>{dateRange}</div></div>
        <section className="stats-grid" aria-label="Показатели за выбранный период">
          <div className="stat-card stat-primary"><div className="stat-title"><Text variant="body-2" color="secondary">{metricNames[metric]}</Text><span className="stat-icon"><Mark kind="chart"/></span></div><Text variant="display-2" className="stat-value">{number(total)}</Text><div className="stat-bottom"><span className="growth">↗ {growth}%</span><span>к предыдущему периоду</span></div></div>
          <div className="stat-card"><div className="stat-title"><Text variant="body-2" color="secondary">В среднем за день</Text><span className="quiet-symbol">≈</span></div><Text variant="display-2" className="stat-value">{number(average)}</Text><div className="stat-bottom"><span className="small-dot"/>За выбранные {days} дней</div></div>
          <div className="stat-card"><div className="stat-title"><Text variant="body-2" color="secondary">Максимум за день</Text><span className="quiet-symbol">↗</span></div><Text variant="display-2" className="stat-value">{number(peak.current)}</Text><div className="stat-bottom">{peak.date.toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', timeZone: 'UTC'})}<span className="mini-label">Лучший день</span></div></div>
          <div className="stat-card"><div className="stat-title"><Text variant="body-2" color="secondary">Изменение за период</Text><span className="quiet-symbol">↗</span></div><Text variant="display-2" className="stat-value positive">+{number(total - previousTotal)}</Text><div className="stat-bottom"><span className="small-dot positive-dot"/>Уверенный рост</div></div>
        </section>
        <section className="chart-card" aria-label="Динамика посещаемости">
          <div className="chart-heading"><div><Text variant="header-1" as="h2">Динамика посещаемости</Text><Text variant="body-2" color="secondary" as="p">Каждая точка — чуть больше понимания вашей аудитории</Text></div><Select value={[metric]} onUpdate={v => setMetric(v[0])} size="l" width={160} aria-label="Показатель графика" options={Object.entries(metricNames).map(([value, content]) => ({value, content}))}/></div>
          <div className="chart-toolbar"><div className="legend"><span><i className="legend-line current"/>{metricNames[metric]}</span>{compare && <span><i className="legend-line previous"/>Предыдущий период</span>}</div><div className="group-control"><span>Группировка</span><Select value={[group]} onUpdate={v => setGroup(v[0])} view="clear" aria-label="Группировка данных" options={[{value: 'day', content: 'По дням'}, {value: 'week', content: 'По неделям'}]}/></div></div>
          <div className="axis-caption">{metricNames[metric]}, {group === 'day' ? 'в день' : 'за неделю'}</div>
          <div className="chart-container" role="img" aria-label={`${metricNames[metric]}: ${number(total)} за ${days} дней, рост ${growth} процентов`}><Chart key={theme} data={data}/></div>
          <div className="chart-footer"><Switch checked={compare} onUpdate={setCompare} size="m">Сравнить с предыдущим периодом</Switch><span className="hover-hint"><Mark kind="info"/>Наведите на график, чтобы увидеть детали</span></div>
        </section>
        <div className="bottom-grid"><section className="insight-card"><div className="insight-icon"><Mark kind="arrow"/></div><div><Text variant="subheader-2" as="h3">Хорошая динамика</Text><Text variant="body-2" as="p" color="secondary">За {days} дней показатель «{metricNames[metric].toLowerCase()}» вырос на <strong>{growth}%</strong>.<br/>Лучший результат — <strong>{dateLabel(peak.date)}</strong>: {number(peak.current)} за день.</Text></div><span className="insight-decoration" aria-hidden="true">↗</span></section><section className="about-card"><div className="about-title"><span className="small-dot positive-dot"/><Text variant="subheader-2" as="h3">Данные под рукой</Text><span className="mini-label">Демо</span></div><Text variant="body-2" as="p" color="secondary">Пример отчёта на демонстрационных данных.<br/>Выберите период и исследуйте график в удобной теме.</Text></section></div>
        <footer className="page-footer"><span>pulse<span className="brand-period">.</span> <span className="footer-caption">Меньше шума. Больше смысла.</span></span><span className="theme-status"><span className="small-dot"/>График адаптирован к {dark ? 'тёмной' : 'светлой'} теме</span></footer>
        <span className="sr-only" role="status">{exported ? 'Данные экспортированы в CSV' : ''}</span>
      </main>
    </div>
  );
}
