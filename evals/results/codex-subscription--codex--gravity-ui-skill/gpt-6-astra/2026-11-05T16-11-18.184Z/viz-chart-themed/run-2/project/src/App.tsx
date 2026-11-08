import {useMemo, useState} from 'react';
import {Chart, type ChartData} from '@gravity-ui/charts';
import {Button, SegmentedRadioGroup, Text, useThemeType} from '@gravity-ui/uikit';
import './App.css';

const dailyVisits = [1240,1420,1350,1680,1540,1320,1470,1760,1920,1780,1640,1850,2140,1980,1810,2240,2460,2180,2320,2050,2240,2630,2480,2710,2560,2340,2670,2890,2740,3120];
const dataset = dailyVisits.map((visits, index) => ({
  date: Date.UTC(2026, 9, index + 1),
  visits,
  visitors: Math.round(visits * (0.63 + (index % 4) * 0.025)),
  returning: Math.round(visits * (0.25 + (index % 3) * 0.018)),
}));
const definitions = [
  {key: 'visits', name: 'Визиты', color: 'var(--g-color-text-utility)', description: 'Все посещения сайта'},
  {key: 'visitors', name: 'Посетители', color: 'var(--g-color-text-info)', description: 'Посетители за каждый день'},
  {key: 'returning', name: 'Повторные визиты', color: 'var(--g-color-text-warning)', description: 'Возвращения на сайт'},
] as const;
const number = (value: number) => new Intl.NumberFormat('ru-RU').format(value);
const dateLabel = (value: number) => new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'}).format(value);

export function App({onThemeChange}: {onThemeChange: (theme: 'light' | 'dark') => void}) {
  const theme = useThemeType();
  const [period, setPeriod] = useState('30');
  const [visible, setVisible] = useState<string[]>(definitions.map(item => item.key));
  const [showTable, setShowTable] = useState(false);
  const rows = useMemo(() => dataset.slice(-Number(period)), [period]);
  const totals = definitions.map(item => rows.reduce((total, row) => total + row[item.key], 0));
  const chartData = useMemo<ChartData>(() => ({
    series: {
      data: definitions.filter(item => visible.includes(item.key)).map(item => ({
        type: 'line', name: item.name, color: item.color, lineWidth: 2.5,
        interpolation: {type: 'monotone'},
        data: rows.map(row => ({x: row.date, y: row[item.key]})),
      })),
    },
    legend: {enabled: false},
    xAxis: {type: 'datetime', labels: {dateFormat: 'D MMM'}, grid: {enabled: false}, ticks: {pixelInterval: 110}},
    yAxis: [{min: 0, max: 3500, ticks: {pixelInterval: 65}, grid: {enabled: true}, title: {text: ''}}],
    tooltip: {enabled: true},
  }), [rows, visible]);
  const growth = Math.round((rows.slice(-3).reduce((sum, row) => sum + row.visits, 0) / rows.slice(0, 3).reduce((sum, row) => sum + row.visits, 0) - 1) * 100);
  const peak = rows.reduce((best, row) => row.visits > best.visits ? row : best);

  function exportData() {
    const csv = '\uFEFFДата;Визиты;Посетители;Повторные визиты\n' + rows.map(row =>
      `${new Date(row.date).toISOString().slice(0, 10)};${row.visits};${row.visitors};${row.returning}`,
    ).join('\n');
    const url = URL.createObjectURL(new Blob([csv], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-traffic-${period}-days.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="./" aria-label="Pulse — главная"><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span><span>pulse<span className="brand-period">.</span></span></a>
          <span className="header-divider"/>
          <Text variant="body-2" className="workspace-name">Веб-аналитика</Text>
          <div className="header-actions"><span className="demo-pill"><span className="status-dot"/>Демо-проект</span><span className="avatar">P</span></div>
        </div>
      </header>
      <main className="main">
        <div className="breadcrumb"><span>Рабочее пространство</span><span className="breadcrumb-slash">/</span><span>Обзор</span></div>
        <div className="page-heading">
          <div><div className="eyebrow">АНАЛИТИКА САЙТА</div><Text as="h1" variant="display-2">Обзор посещаемости</Text><Text as="p" variant="body-2" color="secondary">Ваши данные в перспективе. Следите за тем, как растёт аудитория.</Text></div>
          <Button view="outlined" size="l" onClick={exportData}><span className="export-arrow" aria-hidden="true">↓</span> Экспорт CSV</Button>
        </div>

        <section className="metrics" aria-label="Показатели за выбранный период">
          {definitions.map((item, index) => <div className="metric" key={item.key}>
            <div className="metric-label"><span className="series-dot" style={{background: item.color}}/><Text variant="body-2" color="secondary">{item.name}</Text><span className="metric-index">0{index + 1}</span></div>
            <div className="metric-value"><Text variant="display-2">{number(totals[index])}</Text><span className="metric-unit">{index === 1 ? 'за период¹' : 'за период'}</span></div>
            <Text variant="body-1" color="secondary">{item.description}</Text>
          </div>)}
        </section>

        <section className="chart-card" aria-labelledby="chart-title">
          <div className="chart-heading"><div><Text as="h2" id="chart-title" variant="header-1">Динамика посещаемости</Text><Text as="p" variant="body-1" color="secondary">Как менялась активность вашей аудитории</Text></div>
            <SegmentedRadioGroup aria-label="Период графика" size="m" value={period} onUpdate={setPeriod} options={[{value: '7', content: '7 дней'}, {value: '14', content: '14 дней'}, {value: '30', content: '30 дней'}]}/>
          </div>
          <div className="chart-toolbar"><div className="legend" aria-label="Серии графика">{definitions.map(item => <Button key={item.key} view="flat" size="s" aria-pressed={visible.includes(item.key)} className={`legend-button ${visible.includes(item.key) ? '' : 'legend-button-hidden'}`} onClick={() => setVisible(current => current.includes(item.key) ? current.filter(key => key !== item.key) : [...current, item.key])}><span className="legend-line" style={{background: item.color}}/>{item.name}</Button>)}</div><span className="date-range">{dateLabel(rows[0].date)} — {dateLabel(rows[rows.length - 1].date)} 2026</span></div>
          <div className="chart-axis-caption">Количество</div>
          <div className="chart-container" role="region" aria-label={`Линейный график посещаемости за ${period} дней. Данные доступны в таблице ниже.`}>
            {visible.length ? <Chart data={chartData} lang="ru"/> : <div className="empty-chart"><Text variant="subheader-2">Какие данные показать?</Text><Text color="secondary">Выберите хотя бы одну серию над графиком.</Text><Button view="normal" onClick={() => setVisible(definitions.map(item => item.key))}>Показать все серии</Button></div>}
          </div>
          <div className="chart-footer"><span className="chart-tip"><span className="info-symbol" aria-hidden="true">i</span> Наведите на график, чтобы увидеть точные значения</span><Button view="flat-secondary" size="s" onClick={() => setShowTable(value => !value)} aria-expanded={showTable}>{showTable ? 'Скрыть данные ↑' : 'Посмотреть данные ↗'}</Button></div>
          {showTable && <div className="data-table-wrap"><table><caption>Ежедневные данные за выбранный период</caption><thead><tr><th scope="col">Дата</th>{definitions.map(item => <th key={item.key} scope="col">{item.name}</th>)}</tr></thead><tbody>{rows.map(row => <tr key={row.date}><th scope="row">{dateLabel(row.date)}</th>{definitions.map(item => <td key={item.key}>{number(row[item.key])}</td>)}</tr>)}</tbody></table></div>}
        </section>

        <div className="bottom-grid">
          <section className="insight-card"><div className="insight-icon" aria-hidden="true">↗</div><div><div className="insight-title"><Text variant="subheader-2">Аудитория растёт</Text><span className="growth-badge">+{growth}%</span></div><Text as="p" variant="body-1" color="secondary">В последние 3 дня визитов больше, чем в первые 3 дня периода.<br className="desktop-break"/> Пик активности — {dateLabel(peak.date)}: {number(peak.visits)} визитов.</Text></div></section>
          <section className="theme-card"><div><Text as="h2" variant="subheader-2">Комфортно в любой теме</Text><Text as="p" variant="body-1" color="secondary">График подстраивается под вас.</Text></div><SegmentedRadioGroup aria-label="Тема приложения" value={theme} onUpdate={value => onThemeChange(value as 'light' | 'dark')} size="m" options={[{value: 'light', content: '☀ Светлая'}, {value: 'dark', content: '☾ Тёмная'}]}/></section>
        </div>
        <footer className="page-footer"><span><span className="status-dot"/> Демонстрационные данные · октябрь 2026</span><span>¹ Сумма дневных значений посетителей</span></footer>
      </main>
    </div>
  );
}
