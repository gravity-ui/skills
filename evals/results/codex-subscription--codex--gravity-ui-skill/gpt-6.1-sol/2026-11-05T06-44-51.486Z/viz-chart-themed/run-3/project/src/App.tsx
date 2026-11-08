import {useMemo, useState} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Button, Checkbox, Icon, SegmentedRadioGroup, Select, Text, useThemeType} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, Calendar, ChartColumn, ChartLine, ChevronRight, CircleCheck, CircleQuestion, Clock, Globe, Moon, Persons, Sun} from '@gravity-ui/icons';
import './App.css';

const DAY = 86_400_000;
const END = Date.UTC(2026, 9, 30);
const number = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
const date = (value: number) => new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'}).format(value).replace('.', '');
const metrics = [
  {id: 'visitors', name: 'Посетители', icon: Persons, factor: 1, description: 'Уникальные посетители за каждый день'},
  {id: 'views', name: 'Просмотры', icon: ChartColumn, factor: 2.63, description: 'Просмотры страниц за каждый день'},
  {id: 'sessions', name: 'Сессии', icon: Clock, factor: 1.38, description: 'Посещения сайта за каждый день'},
  {id: 'events', name: 'События', icon: ChartLine, factor: 4.17, description: 'Действия посетителей за каждый день'},
];
const shape = [1810, 2150, 2050, 1920, 2560, 2390, 2110, 2630, 2840, 2590, 2370, 2690, 3210, 3030, 2740, 2860, 3190, 3450, 3030, 2860, 3310, 3610, 3390, 3180, 3540, 4020, 3790, 3520, 3860, 4180];
type Point = {x: number; y: number};
const sum = (points: Point[]) => points.reduce((total, point) => total + point.y, 0);
function makeData(days: number, factor: number, previous = false): Point[] {
  return Array.from({length: days}, (_, i) => {
    const position = 30 - days + i;
    const base = position >= 0 ? shape[position] : 1700 + (position + 60) * 12 + Math.sin(i * 1.3) * 320;
    return {x: END - (days - i - 1) * DAY, y: Math.round(base * factor * (previous ? 0.77 + Math.sin(i * 1.7) * 0.09 : 1))};
  });
}
function aggregate(points: Point[], weekly: boolean) {
  if (!weekly) return points;
  return points.reduce<Point[]>((result, point, i) => {
    if (i % 7 === 0) result.push({...point}); else result[result.length - 1].y += point.y;
    return result;
  }, []);
}

export function App({onThemeChange}: {onThemeChange: (theme: 'light' | 'dark') => void}) {
  const theme = useThemeType();
  const [period, setPeriod] = useState('30');
  const [metricId, setMetricId] = useState('visitors');
  const [compare, setCompare] = useState(true);
  const [interval, setInterval] = useState(['day']);
  const [device, setDevice] = useState(['all']);
  const [helpOpen, setHelpOpen] = useState(false);
  const metric = metrics.find(item => item.id === metricId)!;
  const days = Number(period);
  const deviceFactor = device[0] === 'mobile' ? 0.64 : device[0] === 'desktop' ? 0.36 : 1;
  const current = useMemo(() => makeData(days, metric.factor * deviceFactor), [days, metric.factor, deviceFactor]);
  const previous = useMemo(() => makeData(days, metric.factor * deviceFactor, true), [days, metric.factor, deviceFactor]);
  const total = sum(current);
  const growth = ((total / sum(previous) - 1) * 100).toFixed(1).replace('.', ',');
  const best = current.reduce((max, point) => point.y > max.y ? point : max);
  const firstDate = current[0].x;
  const range = `${date(firstDate)} — ${date(END)} 2026`;
  const chartData = useMemo<ChartData>(() => ({
    chart: {margin: {top: 24, right: 12, bottom: 8, left: 0}},
    legend: {enabled: false},
    xAxis: {
      type: 'datetime', min: firstDate, max: END, startOnTick: false, endOnTick: false,
      grid: {enabled: false}, lineVisible: false,
      labels: {dateFormat: 'DD MMM', style: {fill: 'var(--g-color-text-secondary)', fontSize: '12px'}}, ticks: {interval: 130},
    },
    yAxis: [{min: 0, max: Math.ceil(Math.max(...aggregate(current, interval[0] === 'week').map(p => p.y)) / 1000) * 1000,
      grid: {enabled: true}, lineVisible: false, ticks: {interval: 65},
      labels: {style: {fill: 'var(--g-color-text-hint)', fontSize: '12px'}}}],
    series: {data: [
      ...(compare ? [{type: 'line' as const, name: 'Предыдущий период', color: 'var(--g-color-text-hint)', dashStyle: 'Dash' as const, lineWidth: 2, interpolation: {type: 'monotone' as const}, data: aggregate(previous, interval[0] === 'week')}] : []),
      {type: 'line', name: metric.name, color: 'var(--g-color-text-utility)', lineWidth: 3, interpolation: {type: 'monotone'}, data: aggregate(current, interval[0] === 'week')},
    ]},
    tooltip: {enabled: true},
  }), [current, previous, compare, interval, firstDate, metric.name]);

  function exportData() {
    const rows = ['Дата;' + metric.name + ';Предыдущий период', ...current.map((point, i) => `${new Date(point.x).toISOString().slice(0, 10)};${point.y};${previous[i].y}`)];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\r\n')], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-${metricId}-${period}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="app">
    <header className="topbar"><div className="topbar-inner">
      <a className="brand" href="./" aria-label="Пульс — главная"><span className="brand-mark"><Icon data={ChartLine} size={22}/></span><span>пульс<span className="brand-dot">.</span></span></a>
      <div className="workspace-label"><span className="header-divider"/><Icon data={Globe} size={15}/><span>Мой проект</span><span className="demo-badge">Демо</span></div>
      <div className="header-actions"><span className="theme-label">Тема оформления</span>
        <SegmentedRadioGroup value={theme} onUpdate={onThemeChange} size="m" aria-label="Тема оформления" options={[
          {value: 'light', content: <Icon data={Sun} size={16}/>, title: 'Светлая тема'},
          {value: 'dark', content: <Icon data={Moon} size={16}/>, title: 'Тёмная тема'},
        ]}/><span className="header-divider"/><div className="user-avatar" title="Анна Смирнова">АС</div>
      </div>
    </div></header>
    <main className="main">
      <div className="breadcrumb"><span>Мой проект</span><Icon data={ChevronRight} size={12}/><span>Аналитика</span></div>
      <div className="page-heading"><div><div className="title-line"><Text as="h1" variant="display-1">Обзор посещаемости</Text><span className="live-status"><span/> Всё под контролем</span></div><Text as="p" variant="body-2" color="secondary" className="subtitle">Ваши данные. Ясная картина. Каждый день.</Text></div><Button view="outlined" size="l" onClick={exportData}><Icon data={ArrowDownToLine} size={16}/> Экспорт</Button></div>
      <div className="filters"><div className="period-controls"><SegmentedRadioGroup size="l" value={period} onUpdate={setPeriod} aria-label="Период" options={[{value: '7', content: '7 дней'}, {value: '30', content: '30 дней'}, {value: '90', content: '90 дней'}]}/><span className="date-range"><Icon data={Calendar} size={16}/>{range}</span></div><Select size="l" value={device} onUpdate={setDevice} aria-label="Устройства" options={[{value: 'all', content: 'Все устройства'}, {value: 'desktop', content: 'Компьютеры'}, {value: 'mobile', content: 'Мобильные'}]}/></div>
      <section className="metrics" aria-label="Основные показатели">{metrics.map(item => <div key={item.id} className={`metric-card ${item.id === metricId ? 'metric-card-selected' : ''}`}>
        <span className="metric-top"><span>{item.name}</span><Icon data={item.icon} size={18}/></span>
        <Text as="span" variant="display-2" className="metric-value">{number(sum(makeData(days, item.factor * deviceFactor)))}</Text>
        <span className="metric-bottom"><span className="growth"><Icon data={ArrowUpRight} size={13}/> {growth}%</span><span>к прошлому периоду</span></span>
        <Button className="metric-select" view="flat" onClick={() => setMetricId(item.id)} aria-pressed={item.id === metricId} aria-label={`Показать на графике: ${item.name}`}/>
      </div>)}</section>
      <section className="chart-panel" aria-label="График посещаемости">
        <div className="chart-heading"><div><div className="chart-title"><Text as="h2" variant="header-1">Динамика посещаемости</Text><Button view="flat-secondary" size="s" aria-label="Информация о графике" onClick={() => setHelpOpen(!helpOpen)} selected={helpOpen}><Icon data={CircleQuestion} size={16}/></Button></div><Text as="p" variant="body-1" color="secondary" className="chart-description">{metric.description}</Text></div><Select size="m" value={interval} onUpdate={setInterval} aria-label="Группировка данных" options={[{value: 'day', content: 'По дням'}, {value: 'week', content: 'По неделям'}]}/></div>
        {helpOpen && <div className="help-note" role="status">Наведите на линию, чтобы увидеть значения. Пунктир показывает предыдущие {days} дней, совмещённые с текущим периодом. Данные демонстрационные.</div>}
        <div className="chart-toolbar"><div className="legend"><span className="legend-item"><i className="legend-line current"/>{metric.name}</span>{compare && <span className="legend-item"><i className="legend-line previous"/>Предыдущий период</span>}</div><Checkbox checked={compare} onUpdate={setCompare}>Сравнить с прошлым периодом</Checkbox></div>
        <div className="chart-wrap" role="img" aria-label={`${metric.name}: ${range}. Всего ${number(total)}, рост ${growth} процента.`}><Chart data={chartData} lang="ru"/></div>
        <div className="chart-footer"><span><span className="status-dot"/> Данные за {days} дней</span><span>Часовой пояс: UTC+0</span></div>
      </section>
      <section className="details" aria-label="Итоги периода">
        <div className="detail-item"><span className="detail-icon"><Icon data={ChartColumn} size={20}/></span><div><Text as="p" variant="body-1" color="secondary">В среднем за день</Text><Text as="p" variant="header-2">{number(Math.round(total / days))}<span className="detail-unit">за сутки</span></Text></div></div>
        <div className="detail-item"><span className="detail-icon"><Icon data={ArrowUpRight} size={20}/></span><div><Text as="p" variant="body-1" color="secondary">Лучший день · {date(best.x)}</Text><Text as="p" variant="header-2">{number(best.y)}<span className="detail-unit">за сутки</span></Text></div></div>
        <div className="detail-item"><span className="detail-icon positive-icon"><Icon data={ChartLine} size={20}/></span><div><Text as="p" variant="body-1" color="secondary">Рост за период</Text><Text as="p" variant="header-2" className="positive">+{growth}%<span className="detail-unit">отличная динамика</span></Text></div></div>
      </section>
      <div className="insight"><span className="insight-icon"><Icon data={ChartLine} size={21}/></span><div><Text as="p" variant="subheader-1">Вы движетесь в правильном направлении</Text><Text as="p" variant="body-1" color="secondary">Показатель «{metric.name}» вырос на {growth}% по сравнению с предыдущим периодом. Продолжайте в том же темпе.</Text></div><span className="insight-spark">↗</span></div>
      <footer className="page-footer"><span>Пульс — внимание к каждому показателю</span><span><Icon data={CircleCheck} size={14}/> Демонстрационные данные</span></footer>
    </main>
  </div>;
}
