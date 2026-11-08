import {useMemo, useState} from 'react';
import {Chart, type ChartData, type LineSeries} from '@gravity-ui/charts';
import {Button, SegmentedRadioGroup, Select, Switch, Text, useThemeType} from '@gravity-ui/uikit';
import './App.css';

export type AppTheme = 'system' | 'light' | 'dark';
const numbers = new Intl.NumberFormat('ru-RU');
const metricOptions = [
  {value: 'visits', content: 'Визиты'},
  {value: 'views', content: 'Просмотры'},
  {value: 'events', content: 'События'},
] as const;
type Metric = (typeof metricOptions)[number]['value'];
const base = [1120, 1280, 1210, 1490, 1380, 980, 1050, 1430, 1590, 1480, 1710, 1630, 1210, 1320, 1690, 1820, 1740, 1980, 1860, 1430, 1560, 1890, 2050, 1940, 2180, 2090, 1760, 2380, 2210, 2470];
const factors: Record<Metric, number> = {visits: 1, views: 2.43, events: 3.18};
function getValues(metric: Metric, days: number) {
  return base.slice(-days).map((value, i) => ({
    day: 31 - days + i,
    current: Math.round(value * factors[metric]),
    previous: Math.round((value * 0.79 + Math.sin((31 - days + i) * 1.7) * 130) * factors[metric]),
  }));
}

export function App({theme, onThemeChange}: {theme: AppTheme; onThemeChange: (theme: AppTheme) => void}) {
  const themeType = useThemeType();
  const [period, setPeriod] = useState('30');
  const [metric, setMetric] = useState<Metric>('visits');
  const [compare, setCompare] = useState(true);
  const days = Number(period);
  const points = useMemo(() => getValues(metric, days), [metric, days]);
  const current = points.reduce((total, point) => total + point.current, 0);
  const previous = points.reduce((total, point) => total + point.previous, 0);
  const growth = ((current / previous - 1) * 100).toLocaleString('ru-RU', {maximumFractionDigits: 1});
  const peak = points.reduce((best, point) => point.current > best.current ? point : best);
  const selectedLabel = metricOptions.find((option) => option.value === metric)!.content;

  const chartData = useMemo<ChartData>(() => {
    const series: LineSeries[] = [{
      type: 'line', name: 'Выбранный период',
      color: 'var(--g-color-text-utility)', lineWidth: 3,
      interpolation: {type: 'monotone'},
      data: points.map((point) => ({x: `${point.day} окт.`, y: point.current})),
    }];
    if (compare) series.push({
      type: 'line', name: 'Предыдущий период',
      color: 'var(--g-color-text-hint)', lineWidth: 2, dashStyle: 'Dash',
      interpolation: {type: 'monotone'},
      data: points.map((point) => ({x: `${point.day} окт.`, y: point.previous})),
    });
    return {
      series: {data: series}, legend: {enabled: false},
      chart: {margin: {top: 22, right: 14, bottom: 8, left: 4}},
      xAxis: {type: 'category', categories: points.map((point) => `${point.day} окт.`), grid: {enabled: false}, lineVisible: false},
      yAxis: [{min: 0, lineVisible: false, ticks: {interval: 75}}],
      tooltip: {enabled: true},
    };
  }, [points, compare]);

  function downloadCsv() {
    const rows = [
      ['Дата', selectedLabel, ...(compare ? ['Предыдущий период (соответствующий день)'] : [])],
      ...points.map((point) => [`2026-10-${String(point.day).padStart(2, '0')}`, point.current, ...(compare ? [point.previous] : [])]),
    ];
    const url = URL.createObjectURL(new Blob(['\uFEFF' + rows.map((row) => row.join(';')).join('\r\n')], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `pulse-${metric}-${period}days.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <a href="#main" className="brand" aria-label="Пульс — на главную">
            <span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span>
            <Text variant="header-1">пульс<span className="brand-dot">.</span></Text>
          </a>
          <div className="header-divider" />
          <Text variant="body-2" className="product-label">Продуктовая аналитика</Text>
          <div className="theme-control">
            <Text variant="body-1" color="secondary">Тема</Text>
            <Select aria-label="Тема приложения" size="m" value={[theme]}
              onUpdate={([value]) => onThemeChange(value as AppTheme)}
              options={[{value: 'system', content: 'Системная'}, {value: 'light', content: 'Светлая'}, {value: 'dark', content: 'Тёмная'}]} />
          </div>
          <span className="profile" title="Демонстрационное пространство">Д</span>
        </div>
      </header>
      <main id="main" className="main">
        <div className="breadcrumbs"><span>Рабочее пространство</span><span aria-hidden="true">/</span><span>Обзор</span></div>
        <div className="page-heading">
          <div>
            <div className="heading-title"><Text as="h1" variant="display-1">Обзор активности</Text><span className="demo-badge">Демо</span></div>
            <Text as="p" variant="body-2" color="secondary">Все ключевые показатели вашего продукта в одном месте.</Text>
          </div>
          <Button size="l" view="outlined" onClick={downloadCsv}><span className="download-symbol" aria-hidden="true">↓</span>Экспорт CSV</Button>
        </div>
        <div className="period-toolbar">
          <div className="period-control"><Text variant="body-1" color="secondary">Период</Text>
            <SegmentedRadioGroup aria-label="Период графика" value={period} onUpdate={setPeriod} size="m" options={[
              {value: '7', content: '7 дней'}, {value: '14', content: '14 дней'}, {value: '30', content: '30 дней'},
            ]} />
          </div>
          <Text variant="body-1" color="secondary">{31 - days}–30 октября 2026</Text>
        </div>
        <section className="metrics" aria-label="Ключевые показатели">
          {metricOptions.map((option, index) => {
            const values = getValues(option.value, days);
            const total = values.reduce((sum, point) => sum + point.current, 0);
            const oldTotal = values.reduce((sum, point) => sum + point.previous, 0);
            const delta = ((total / oldTotal - 1) * 100).toLocaleString('ru-RU', {maximumFractionDigits: 1});
            return <div className={`metric-card${metric === option.value ? ' metric-card-active' : ''}`} key={option.value}>
              <div className="metric-top"><Text variant="body-2" color="secondary">{option.content}</Text><span className="metric-symbol" aria-hidden="true">{['↗', '◫', 'ϟ'][index]}</span></div>
              <div className="metric-value"><Text variant="display-2">{numbers.format(total)}</Text><span className="growth">↗ {delta}%</span></div>
              <Text variant="body-1" color="hint">к предыдущим {days} дням</Text>
            </div>;
          })}
        </section>
        <section className="chart-card" aria-labelledby="chart-title">
          <div className="chart-heading">
            <div><Text as="h2" id="chart-title" variant="header-1">Динамика активности</Text><Text as="p" variant="body-1" color="secondary">Как меняются показатели день за днём</Text></div>
            <Select aria-label="Показатель графика" value={[metric]} onUpdate={([value]) => setMetric(value as Metric)} options={[...metricOptions]} size="m" width={152} />
          </div>
          <div className="chart-toolbar">
            <div className="chart-legend"><span><i className="legend-line current-line" />Выбранный период</span>{compare && <span><i className="legend-line previous-line" />Предыдущий период</span>}</div>
            <Switch checked={compare} onUpdate={setCompare} size="m">Сравнить периоды</Switch>
          </div>
          <div className="chart-unit"><Text variant="caption-2" color="hint">{selectedLabel}, в день</Text></div>
          <div className="chart" role="img" aria-label={`${selectedLabel} за ${days} дней. Всего ${numbers.format(current)}. Пик ${peak.day} октября: ${numbers.format(peak.current)}.`}>
            <Chart data={chartData} lang="ru" />
          </div>
          <div className="chart-bottom"><span className="status-dot" /><Text variant="body-1" color="secondary">Демонстрационные данные</Text><Text variant="body-1" color="hint" className="hover-hint">Наведите на график, чтобы увидеть значения</Text></div>
        </section>
        <div className="insight">
          <span className="insight-symbol" aria-hidden="true">↗</span>
          <div><Text variant="subheader-1">Активность растёт</Text><Text as="p" variant="body-1" color="secondary">{selectedLabel}: на {growth}% больше, чем за предыдущие {days} дней. Пик — {peak.day} октября: {numbers.format(peak.current)}.</Text></div>
          <span className="insight-tag">+{growth}%</span>
        </div>
        <footer className="footer"><Text variant="caption-2" color="hint">Пульс · Аналитика, которая помогает расти</Text><span className="theme-status"><span className="theme-indicator" />{themeType === 'dark' ? 'Тёмная' : 'Светлая'} тема активна</span></footer>
      </main>
    </div>
  );
}
