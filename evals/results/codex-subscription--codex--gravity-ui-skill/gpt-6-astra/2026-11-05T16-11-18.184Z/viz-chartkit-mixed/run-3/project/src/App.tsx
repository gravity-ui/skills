import {useEffect, useMemo, useState} from 'react';
import {Button, SegmentedRadioGroup, Select, Switch, Text} from '@gravity-ui/uikit';
import {VisualizationWidget} from './components/VisualizationWidget';
import {createMonitoring, createSales, exportCsv, money, number, type VisualizationMode} from './data';
import './styles.css';

function ChartGlyph({pulse = false}: {pulse?: boolean}) {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={pulse ? 'M2 12h4l3-8 5 16 3-8h5' : 'M4 4v16h16M8 14l4-5 4 3 5-7'}/></svg>;
}
function DownloadGlyph() {return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 15v5h14v-5"/></svg>;}

export function App() {
  const [mode, setMode] = useState<VisualizationMode>('sales');
  const [salesPeriod, setSalesPeriod] = useState('30');
  const [monitorPeriod, setMonitorPeriod] = useState('60');
  const [comparison, setComparison] = useState(true);
  const [live, setLive] = useState(true);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000) * 1000);
  const [updated, setUpdated] = useState(() => Date.now());
  const [refreshing, setRefreshing] = useState(false);
  const [exported, setExported] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  useEffect(() => {
    if (mode !== 'monitoring' || !live) return;
    const interval = window.setInterval(() => {setNow(Math.floor(Date.now() / 1000) * 1000); setUpdated(Date.now());}, 5000);
    return () => clearInterval(interval);
  }, [mode, live]);
  useEffect(() => {
    if (!refreshing) return;
    const timeout = window.setTimeout(() => {setNow(Math.floor(Date.now() / 1000) * 1000); setUpdated(Date.now()); setRefreshing(false);}, 450);
    return () => clearTimeout(timeout);
  }, [refreshing]);
  useEffect(() => {if (!exported) return; const timeout = setTimeout(() => setExported(false), 2500); return () => clearTimeout(timeout);}, [exported]);
  const allSeries = useMemo(() => mode === 'sales' ? createSales(Number(salesPeriod)) : createMonitoring(Number(monitorPeriod), now), [mode, salesPeriod, monitorPeriod, now]);
  const series = useMemo(() => allSeries.filter((s) => comparison || !s.secondary), [allSeries, comparison]);
  const values = allSeries[0].points.map((p) => p.y);
  const total = values.reduce((sum, value) => sum + value, 0);
  const previous = allSeries[1].points.reduce((sum, point) => sum + point.y, 0);
  const growth = ((total / previous - 1) * 100).toFixed(1).replace('.', ',');
  const sales = mode === 'sales';
  const period = sales ? salesPeriod : monitorPeriod;
  const startDate = new Date(allSeries[0].points[0].x).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'});
  const endDate = new Date(allSeries[0].points.at(-1)!.x).toLocaleDateString('ru-RU', {day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC'});
  return <div className="app">
    <header className="topbar"><div className="topbar-inner">
      <div className="brand"><span className="brand-mark"><i/><i/><i/></span>спектр<span className="brand-divider"/><span className="brand-caption">Аналитика в деталях</span></div>
      <div className="account"><span className="workspace-dot"/>Рабочее пространство<span className="avatar">АК</span></div>
    </div></header>
    <main className="workspace">
      <div className="breadcrumbs">Рабочее пространство <span>/</span> <span className="breadcrumb-current">Обзор показателей</span></div>
      <div className="page-heading"><div><div className="eyebrow">ДАННЫЕ, КОТОРЫЕ ПОМОГАЮТ РЕШАТЬ</div><Text variant="display-2" as="h1">Обзор показателей</Text><p>От бизнес-результатов до работы сервисов — в одном виджете.</p></div><span className="demo-label"><span/>Демонстрационные данные</span></div>
      <section className="visualization" aria-label="Виджет аналитики">
        <div className="widget-toolbar">
          <SegmentedRadioGroup value={mode} onUpdate={(value) => setMode(value as VisualizationMode)} size="l">
            <SegmentedRadioGroup.Option value="sales"><span className="mode-option"><ChartGlyph/>Продажи</span></SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="monitoring"><span className="mode-option"><ChartGlyph pulse/>Мониторинг</span></SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
          <div className="toolbar-actions"><Select aria-label="Период графика" size="l" value={[period]} onUpdate={([value]) => sales ? setSalesPeriod(value) : setMonitorPeriod(value)} options={sales ? [{value: '7', content: 'Последние 7 дней'}, {value: '30', content: 'Последние 30 дней'}, {value: '90', content: 'Последние 90 дней'}] : [{value: '15', content: 'Последние 15 минут'}, {value: '60', content: 'Последний час'}, {value: '180', content: 'Последние 3 часа'}]}/><Button view="outlined" size="l" onClick={() => {exportCsv(series, mode); setExported(true);}}><span className="button-content"><DownloadGlyph/>{exported ? 'Скачано' : 'Экспорт'}</span></Button></div>
        </div>
        <div className="widget-body">
          <div className="chart-heading"><div><Text variant="header-1" as="h2">{sales ? 'Динамика продаж' : 'Производительность сервиса'}</Text><p>{sales ? `${startDate} — ${endDate} · по дням` : 'Время ответа API · с точностью до секунды'}</p></div><div className="chart-status"><span className="status-dot"/>{sales ? 'Данные актуальны' : live ? 'В реальном времени' : 'Обновление приостановлено'}</div></div>
          <div className="metrics">
            <div className="metric main-metric"><div className="metric-label">{sales ? 'Общая выручка' : 'Среднее время ответа'}<span className="tiny-info" title={sales ? 'Сумма продаж за выбранный период' : 'Среднее значение p95 за выбранный период'}>i</span></div><div className="metric-value">{sales ? money(total) : `${Math.round(total / values.length)} мс`}</div><div className="metric-description"><span className="growth">↗ {sales ? `+${growth}%` : 'Стабильно'}</span><span>{sales ? 'к предыдущему периоду' : 'в пределах нормы'}</span></div></div>
            <div className="metric"><div className="metric-label">{sales ? 'В среднем за день' : 'Медиана · p50'}</div><div className="metric-value secondary-value">{sales ? money(total / values.length) : `${Math.round(previous / values.length)} мс`}</div><div className="metric-description">{sales ? `За ${period} дней наблюдений` : 'Типичное время ответа'}</div></div>
            <div className="metric"><div className="metric-label">{sales ? 'Лучший день' : 'Пиковое время ответа'}</div><div className="metric-value secondary-value">{sales ? money(Math.max(...values)) : `${Math.max(...values)} мс`}</div><div className="metric-description">{sales ? new Date(allSeries[0].points[values.indexOf(Math.max(...values))].x).toLocaleDateString('ru-RU', {day: 'numeric', month: 'long', timeZone: 'UTC'}) : `${number.format(values.length)} точек в каждой серии`}</div></div>
          </div>
          <div className="plot-label">{sales ? 'Выручка, ₽' : 'Время ответа, мс'}</div>
          <VisualizationWidget mode={mode} series={series} loading={refreshing} onRetry={() => setRefreshing(true)}/>
          <div className="legend-row"><div className="legend"><span><i className="legend-line"/>{allSeries[0].name}</span>{comparison && <span><i className="legend-line previous-line"/>{allSeries[1].name}</span>}</div><Switch size="m" checked={comparison} onUpdate={setComparison}>{sales ? 'Сравнить с прошлым периодом' : 'Показать медиану'}</Switch></div>
        </div>
        <div className="widget-footer"><div className="update-label"><span className="clock-symbol">◷</span> Обновлено в {new Date(updated).toLocaleTimeString('ru-RU', {hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC'})}<span className="footer-divider">·</span>{sales ? 'Часовой пояс: UTC' : 'Интервал: 5 секунд'}</div><div className="footer-actions">{!sales && <Switch size="s" checked={live} onUpdate={setLive}>Автообновление</Switch>}<Button view="flat" size="s" loading={refreshing} onClick={() => setRefreshing(true)}><span className="refresh-symbol">↻</span> Обновить</Button></div></div>
      </section>
      <div className="context-row"><div className="context-icon"><ChartGlyph pulse/></div><div className="context-copy"><Text variant="subheader-1">{sales ? 'За цифрами — больше возможностей' : 'Каждая секунда имеет значение'}</Text><p>{sales ? 'Сравнивайте периоды, замечайте тенденции и находите точки роста.' : 'Отслеживайте нагрузку и замечайте изменения в работе сервиса.'}</p></div><Button view="flat" onClick={() => setShowInfo(!showInfo)}>{showInfo ? 'Скрыть' : 'О данных'} <span className="info-arrow">↗</span></Button></div>
      {showInfo && <div className="data-info" role="status">Это демонстрационный набор данных. Продажи показаны за период по 4 ноября 2026 года. Мониторинг моделирует время ответа API с шагом в одну секунду. Выбранный период и видимые серии сохраняются в CSV при экспорте.</div>}
      <footer className="page-footer"><span>СПЕКТР <span className="footer-dot">/</span> Ясность в каждом показателе</span><span>Создано с Gravity UI</span></footer>
    </main>
  </div>;
}
