import {useMemo, useState, type ComponentProps} from 'react';
import {Chart} from '@gravity-ui/charts';
import {Button, Icon, SegmentedRadioGroup, Select, Text, useThemeType} from '@gravity-ui/uikit';
import {ArrowDownToLine, ArrowUpRight, Calendar, ChartLine, Check, CircleInfo, Moon, Sun, Persons} from '@gravity-ui/icons';
import './App.css';

const number = new Intl.NumberFormat('ru-RU');
const daily = [1120, 1280, 1190, 1460, 1380, 1040, 980, 1420, 1590, 1480, 1740, 1620, 1270, 1190, 1680, 1830, 1760, 2040, 1910, 1490, 1400, 1920, 2140, 2020, 2310, 2180, 1740, 1640, 2220, 2460];
const rows = daily.map((visits, index) => ({day: index + 1, visits, users: Math.round(visits * (0.57 + Math.sin(index * 1.7) * 0.055))}));

export function App({onThemeChange}: {onThemeChange?: (theme: 'light' | 'dark') => void}) {
  const theme = useThemeType();
  const [period, setPeriod] = useState('30');
  const [grouping, setGrouping] = useState('day');
  const [visible, setVisible] = useState({visits: true, users: true});
  const [exported, setExported] = useState(false);
  const selected = rows.slice(-Number(period));
  const total = selected.reduce((sum, row) => sum + row.visits, 0);
  const users = selected.reduce((sum, row) => sum + row.users, 0);
  const average = Math.round(total / selected.length);
  const growth = ((selected.at(-1)!.visits / selected[0].visits - 1) * 100).toFixed(1).replace('.', ',');
  const chartData = useMemo<ComponentProps<typeof Chart>['data']>(() => {
    const days = rows.slice(-Number(period));
    const points = grouping === 'week' ? Array.from({length: Math.ceil(days.length / 7)}, (_, i) => {
      const week = days.slice(i * 7, i * 7 + 7);
      return {day: week[0].day, visits: week.reduce((s, d) => s + d.visits, 0), users: week.reduce((s, d) => s + d.users, 0)};
    }) : days;
    return {
      chart: {margin: {top: 20, right: 12, bottom: 12, left: 4}},
      series: {data: [
        ...(visible.visits ? [{type: 'line' as const, name: 'Посещения', color: 'var(--g-color-text-positive)', lineWidth: 3, interpolation: {type: 'monotone' as const}, marker: {enabled: false}, data: points.map(p => ({x: `${p.day} июн`, y: p.visits}))}] : []),
        ...(visible.users ? [{type: 'line' as const, name: 'Новые пользователи', color: 'var(--g-color-text-utility)', lineWidth: 2.5, interpolation: {type: 'monotone' as const}, marker: {enabled: false}, data: points.map(p => ({x: `${p.day} июн`, y: p.users}))}] : []),
      ]},
      xAxis: {type: 'category', categories: points.map(p => `${p.day} июн`), grid: {enabled: false}, ticks: {values: points.map((_, i) => i).filter(i => i === points.length - 1 || i % (grouping === 'week' ? 1 : Number(period) === 30 ? 5 : 2) === 0)}, labels: {autoRotation: false}, lineVisible: false},
      yAxis: [{min: 0, max: grouping === 'day' ? 3000 : undefined, ticks: {interval: 65}, grid: {enabled: true}, lineVisible: false}],
      legend: {enabled: false},
      tooltip: {enabled: true},
    };
  }, [period, grouping, visible]);

  function exportCsv() {
    const csv = '\uFEFFДата;Посещения;Новые пользователи\n' + selected.map(d => `2026-06-${String(d.day).padStart(2, '0')};${d.visits};${d.users}`).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-june-${period}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setExported(true);
    window.setTimeout(() => setExported(false), 2500);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand"><span className="brand-mark"><Icon data={ChartLine} size={23}/></span><Text variant="header-1">пульс<span className="brand-period">.</span></Text><span className="brand-divider"/><Text className="brand-caption" color="secondary" variant="body-2">Всё важное — в динамике</Text></div>
          <div className="topbar-actions"><span className="workspace-indicator"><span className="status-dot"/>Личное пространство</span><span className="avatar">АК</span></div>
        </div>
      </header>

      <main className="main">
        <div className="breadcrumb"><Icon data={ChartLine} size={15}/><span>Аналитика</span><span className="breadcrumb-slash">/</span><span>Обзор</span></div>
        <div className="page-heading">
          <div><div className="title-row"><Text variant="display-1" as="h1">Обзор активности</Text><span className="demo-label">Демо</span></div><Text variant="body-2" color="secondary">Наблюдайте за ростом и находите новые возможности.</Text></div>
          <div className="theme-control"><span className="theme-caption">Тема</span><SegmentedRadioGroup value={theme} onUpdate={value => onThemeChange?.(value as 'light' | 'dark')} size="m" aria-label="Тема приложения"><SegmentedRadioGroup.Option value="light"><span className="option-content"><Icon data={Sun} size={16}/>Светлая</span></SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="dark"><span className="option-content"><Icon data={Moon} size={16}/>Тёмная</span></SegmentedRadioGroup.Option></SegmentedRadioGroup></div>
        </div>

        <div className="filters"><div className="period-controls"><SegmentedRadioGroup size="l" value={period} onUpdate={setPeriod} aria-label="Период"><SegmentedRadioGroup.Option value="7">7 дней</SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="14">14 дней</SegmentedRadioGroup.Option><SegmentedRadioGroup.Option value="30">30 дней</SegmentedRadioGroup.Option></SegmentedRadioGroup><div className="date-range"><Icon data={Calendar} size={16}/><span>{selected[0].day}–30 июня 2026</span></div></div><Button view="outlined" size="l" onClick={exportCsv}><Icon data={exported ? Check : ArrowDownToLine} size={16}/>{exported ? 'Готово' : 'Экспорт CSV'}</Button></div>

        <section className="metrics" aria-label="Показатели за выбранный период">
          <div className="metric"><div className="metric-label"><span>Всего посещений</span><Icon data={ChartLine} size={17}/></div><div className="metric-value"><Text variant="display-2">{number.format(total)}</Text><span className="growth"><Icon data={ArrowUpRight} size={13}/>{growth}%</span></div><span className="metric-note">рост посещений с начала периода</span><div className="metric-decoration" aria-hidden="true">{daily.slice(-15).map((v,i)=><span key={i} style={{height: `${v / 38}%`}}/>)}</div></div>
          <div className="metric"><div className="metric-label"><span>Новые пользователи</span><Icon data={Persons} size={17}/></div><div className="metric-value"><Text variant="display-2">{number.format(users)}</Text><span className="metric-unit">чел.</span></div><span className="metric-note">{(users / total * 100).toFixed(1).replace('.', ',')}% от общего числа посещений</span><div className="metric-decoration purple" aria-hidden="true">{rows.slice(-15).map((v,i)=><span key={i} style={{height: `${v.users / 21}%`}}/>)}</div></div>
          <div className="metric"><div className="metric-label"><span>В среднем за день</span><Icon data={Calendar} size={17}/></div><div className="metric-value"><Text variant="display-2">{number.format(average)}</Text><span className="metric-unit">посещений</span></div><span className="metric-note">за выбранные {period} дней</span><div className="metric-decoration neutral" aria-hidden="true">{daily.slice(-15).map((v,i)=><span key={i} style={{height: `${v / 40}%`}}/>)}</div></div>
        </section>

        <section className="chart-card" aria-labelledby="chart-heading">
          <div className="chart-heading"><div><Text as="h2" variant="subheader-3" id="chart-heading">Динамика посещений</Text><Text color="secondary" variant="body-1">Как менялась активность вашей аудитории</Text></div><Select size="m" value={[grouping]} onUpdate={value => setGrouping(value[0])} options={[{value:'day',content:'По дням'},{value:'week',content:'По неделям'}]} aria-label="Группировка данных"/></div>
          <div className="chart-toolbar"><div className="legend"><Button view="flat" size="s" onClick={()=>setVisible(v=>({...v, visits: !v.visits}))} aria-pressed={visible.visits} className={!visible.visits ? 'legend-inactive' : ''}><span className="legend-line"/>Посещения</Button><Button view="flat" size="s" onClick={()=>setVisible(v=>({...v, users: !v.users}))} aria-pressed={visible.users} className={!visible.users ? 'legend-inactive' : ''}><span className="legend-line purple"/>Новые пользователи</Button></div><span className="chart-unit">Количество</span></div>
          <div className="chart-container" role="img" aria-label={`Линейный график посещений и новых пользователей за ${period} дней июня 2026 года. Всего ${number.format(total)} посещений.`}>{visible.visits || visible.users ? <Chart data={chartData}/> : <div className="empty-chart"><Icon data={ChartLine} size={32}/><Text variant="subheader-2">Выберите данные для отображения</Text><Text color="secondary">Нажмите на название ряда над графиком.</Text></div>}</div>
          <div className="chart-footer"><span><Icon data={CircleInfo} size={15}/>Наведите на график, чтобы увидеть значения</span><span className="timezone">Часовой пояс: UTC</span></div>
        </section>

        <div className="bottom-panels"><section className="insight-panel"><span className="insight-icon"><Icon data={ArrowUpRight} size={23}/></span><div><Text as="h2" variant="subheader-2">Хороший темп роста</Text><Text color="secondary" variant="body-2">За выбранный период посещаемость выросла на <strong>{growth}%</strong>.<br className="desktop-break"/> Максимум — <strong>{number.format(Math.max(...selected.map(d=>d.visits)))}</strong> посещений 30 июня.</Text></div></section><section className="theme-panel"><span className="theme-preview"><Icon data={theme === 'light' ? Sun : Moon} size={23}/></span><div><Text as="h2" variant="subheader-2">Комфортно в любой теме</Text><Text color="secondary" variant="body-1">График подстраивается под оформление<br className="desktop-break"/> приложения. Попробуйте переключить тему.</Text></div></section></div>
        <footer className="page-footer"><span><span className="status-dot"/>Демонстрационные данные</span><span>Июнь 2026 <span className="footer-dot">·</span> Создано с Gravity UI</span></footer>
      </main>
    </div>
  );
}
