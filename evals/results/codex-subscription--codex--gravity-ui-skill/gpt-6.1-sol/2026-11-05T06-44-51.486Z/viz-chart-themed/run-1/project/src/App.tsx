import {useMemo, useState} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {ArrowDownToLine, ArrowUpRight, ChartLine, Check, ChevronRight, CircleInfo, Moon, Sun} from '@gravity-ui/icons';
import {Button, Icon, SegmentedRadioGroup, Select, Switch, Text, ThemeProvider, useThemeType} from '@gravity-ui/uikit';
import './App.css';

type Metric = 'visits' | 'users' | 'events';
type ThemeChoice = 'light' | 'dark' | 'system';
const daily = [2850, 3120, 2980, 3440, 3690, 3150, 2940, 3280, 3970, 3760, 3510, 4100, 4350, 3820, 3550, 4020, 4740, 4490, 4200, 4680, 5090, 4510, 4240, 4780, 5480, 5120, 4860, 5540, 6010, 5680];
const previous = [2470, 2610, 2550, 2810, 3020, 2720, 2590, 2860, 3190, 2970, 2780, 3280, 3500, 3140, 2900, 3270, 3830, 3520, 3300, 3660, 4060, 3690, 3410, 3780, 4400, 4090, 3860, 4470, 4700, 4560];
const metrics: {id: Metric; name: string; description: string; factor: number}[] = [
  {id: 'visits', name: 'Посещения', description: 'Все визиты на сайт', factor: 1},
  {id: 'users', name: 'Посетители', description: 'Уникальные пользователи', factor: 0.724},
  {id: 'events', name: 'События', description: 'Действия пользователей', factor: 2.36},
];
const number = (value: number) => new Intl.NumberFormat('ru-RU').format(Math.round(value));
const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const dateLabel = (day: number) => `${day} окт`;

export function App() {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    try {const saved = localStorage.getItem('pulse-theme'); if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;} catch { /* Browser storage may be unavailable. */ }
    return 'light';
  });
  const changeTheme = (value: ThemeChoice) => {
    setTheme(value);
    try {localStorage.setItem('pulse-theme', value);} catch { /* Theme still works without storage. */ }
  };
  return <ThemeProvider theme={theme}><Analytics theme={theme} onThemeChange={changeTheme} /></ThemeProvider>;
}

function Analytics({theme, onThemeChange}: {theme: ThemeChoice; onThemeChange: (value: ThemeChoice) => void}) {
  const resolvedTheme = useThemeType();
  const [metric, setMetric] = useState<Metric>('visits');
  const [period, setPeriod] = useState('30');
  const [group, setGroup] = useState('day');
  const [compare, setCompare] = useState(true);
  const [exported, setExported] = useState(false);
  const days = Number(period);
  const selected = metrics.find((item) => item.id === metric)!;
  const currentValues = daily.slice(-days).map((value) => Math.round(value * selected.factor));
  const pastValues = previous.slice(-days).map((value) => Math.round(value * selected.factor));
  const total = sum(currentValues);
  const growth = ((total / sum(pastValues) - 1) * 100).toFixed(1).replace('.', ',');
  const peak = Math.max(...currentValues);
  const peakDay = 31 - days + currentValues.indexOf(peak);
  const startDay = 31 - days;
  const chartData = useMemo<ChartData>(() => {
    const points = (values: number[]) => {
      if (group === 'week') {
        return Array.from({length: Math.ceil(days / 7)}, (_, index) => ({x: Date.UTC(2026, 9, startDay + index * 7), y: sum(values.slice(index * 7, index * 7 + 7))}));
      }
      return values.map((y, index) => ({x: Date.UTC(2026, 9, startDay + index), y}));
    };
    return {
      chart: {margin: {top: 20, right: 14, bottom: 12, left: 4}},
      series: {data: [
        {type: 'line', name: 'Текущий период', color: 'var(--g-color-text-warning-heavy)', lineWidth: 3, marker: {enabled: group === 'week', radius: 4}, interpolation: {type: 'monotone'}, data: points(currentValues)},
        ...(compare ? [{type: 'line' as const, name: 'Предыдущий период', color: 'var(--g-color-text-misc)', lineWidth: 2, dashStyle: 'Dash' as const, marker: {enabled: group === 'week', radius: 3}, interpolation: {type: 'monotone' as const}, data: points(pastValues)}] : []),
      ]},
      xAxis: {type: 'datetime', grid: {enabled: false}, lineVisible: false, labels: {dateFormat: 'DD MMM', style: {color: 'var(--g-color-text-secondary)', fontSize: '12px'}}},
      yAxis: [{min: 0, maxPadding: 0.18, lineVisible: false, labels: {style: {color: 'var(--g-color-text-secondary)', fontSize: '12px'}}, grid: {enabled: true}}],
      legend: {enabled: false},
      tooltip: {enabled: true},
    };
  }, [metric, days, group, compare]);

  const exportCsv = () => {
    const rows = ['Дата;Текущий период;Предыдущий период', ...currentValues.map((value, index) => `2026-10-${String(startDay + index).padStart(2, '0')};${value};${pastValues[index]}`)];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.join('\n')], {type: 'text/csv;charset=utf-8;'}));
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = `pulse-${metric}-october-2026.csv`; anchor.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <a className="brand" href="#" aria-label="Pulse — главная"><span className="brand-mark"><Icon data={ChartLine} size={22}/></span><span>pulse<span className="brand-period">.</span></span></a>
          <span className="header-divider"/>
          <div className="workspace"><span className="workspace-dot"/>Мой проект<Icon data={ChevronRight} size={14}/><span className="workspace-current">Аналитика</span></div>
          <div className="header-right"><span className="demo-badge">Демо-проект</span><Button view="flat" size="l" aria-label={resolvedTheme === 'light' ? 'Включить тёмную тему' : 'Включить светлую тему'} title="Переключить тему" onClick={() => onThemeChange(resolvedTheme === 'light' ? 'dark' : 'light')}><Icon data={resolvedTheme === 'light' ? Moon : Sun} size={18}/></Button><span className="avatar" title="Александр">А</span></div>
        </div>
      </header>
      <main className="main">
        <div className="page-heading">
          <div><div className="eyebrow">ПУЛЬС ВАШЕГО ПРОЕКТА</div><Text variant="display-1" as="h1" className="page-title">Обзор аналитики</Text><Text variant="body-2" color="secondary">Все важные показатели. В одном месте.</Text></div>
          <div className="heading-actions"><Select size="l" value={[period]} onUpdate={([value]) => setPeriod(value)} options={[{value: '30', content: 'Последние 30 дней'}, {value: '14', content: 'Последние 14 дней'}, {value: '7', content: 'Последние 7 дней'}]} aria-label="Период аналитики"/><Button size="l" view="outlined" onClick={exportCsv}><Icon data={exported ? Check : ArrowDownToLine} size={16}/><span>{exported ? 'Скачано' : 'Экспорт'}</span></Button></div>
        </div>
        <div className="section-label"><span className="live-dot"/>Обзор показателей<span className="section-date">{startDay}–30 октября 2026</span></div>
        <div className="metric-grid">
          {metrics.map((item) => {
            const value = sum(daily.slice(-days).map((v) => Math.round(v * item.factor)));
            const past = sum(previous.slice(-days).map((v) => Math.round(v * item.factor)));
            const change = ((value / past - 1) * 100).toFixed(1).replace('.', ',');
            return <Button key={item.id} width="max" view="flat" className={`metric-card ${metric === item.id ? 'metric-card-active' : ''}`} onClick={() => setMetric(item.id)} aria-pressed={metric === item.id}>
              <span className="metric-top"><span>{item.name}</span><Icon data={metric === item.id ? ChartLine : ArrowUpRight} size={18}/></span>
              <span className="metric-value-row"><Text variant="display-2" className="metric-value">{number(value)}</Text><span className="growth"><Icon data={ArrowUpRight} size={13}/> {change}%</span></span>
              <span className="metric-description">{item.description}</span>
            </Button>;
          })}
        </div>
        <section className="chart-panel" aria-label="График динамики показателей">
          <div className="chart-heading"><div><Text variant="subheader-3" as="h2">Динамика {metric === 'visits' ? 'посещений' : metric === 'users' ? 'посетителей' : 'событий'}</Text><div className="chart-subtitle">Как меняется активность вашей аудитории</div></div><SegmentedRadioGroup size="m" value={group} onUpdate={setGroup} aria-label="Группировка данных"><SegmentedRadioGroup.Option value="day">По дням</SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="week">По неделям</SegmentedRadioGroup.Option></SegmentedRadioGroup></div>
          <div className="chart-controls"><div className="chart-legend"><span><i className="legend-line current"/>Текущий период</span>{compare && <span><i className="legend-line past"/>Предыдущий период</span>}</div><Switch checked={compare} onUpdate={setCompare} size="s">Сравнить с прошлым периодом</Switch></div>
          <div className="chart-axis-caption">{selected.name}{group === 'week' ? ' за неделю' : ' за день'}</div>
          <div className="chart-container"><Chart data={chartData} key={resolvedTheme} /></div>
          <div className="chart-insight"><span className="insight-icon"><Icon data={ArrowUpRight} size={18}/></span><div><strong>Хороший темп!</strong> {selected.name} выросли на <strong>{growth}%</strong> по сравнению с предыдущими {days} днями.</div><span className="insight-tag">Положительная динамика</span></div>
        </section>
        <div className="bottom-grid">
          <section className="summary-panel"><div className="panel-title"><Text variant="subheader-2" as="h2">Период в цифрах</Text><span className="muted-icon" title="Показатели рассчитаны по выбранному периоду"><Icon data={CircleInfo} size={16}/></span></div><div className="summary-grid"><div><span className="summary-label">В среднем за день</span><Text variant="header-1">{number(total / days)}</Text><span className="summary-note">{selected.name.toLowerCase()}</span></div><div><span className="summary-label">Лучший день</span><Text variant="header-1">{dateLabel(peakDay)}</Text><span className="summary-note">{number(peak)} {selected.name.toLowerCase()}</span></div><div><span className="summary-label">Изменение за период</span><Text variant="header-1" color="positive">+{growth}%</Text><span className="summary-note">к предыдущему периоду</span></div></div></section>
          <section className="appearance-panel"><div className="panel-title"><div className="appearance-title"><Icon data={resolvedTheme === 'light' ? Sun : Moon} size={18}/><Text variant="subheader-2" as="h2">Ваша тема. Ваш ритм.</Text></div><span className="theme-live-dot"/></div><p>График подстраивается под тему приложения,<br className="desktop-break"/> чтобы данные всегда было легко читать.</p><SegmentedRadioGroup value={theme} onUpdate={(value) => onThemeChange(value as ThemeChoice)} size="m" width="max" aria-label="Тема приложения"><SegmentedRadioGroup.Option value="light"><span className="theme-option"><Icon data={Sun} size={14}/>Светлая</span></SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="dark"><span className="theme-option"><Icon data={Moon} size={14}/>Тёмная</span></SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="system">Системная</SegmentedRadioGroup.Option></SegmentedRadioGroup></section>
        </div>
        <footer className="page-footer"><span><span className="footer-dot"/>Демонстрационные данные</span><span>Создано с Gravity UI <span className="footer-spark">✳</span></span></footer>
      </main>
    </div>
  );
}
