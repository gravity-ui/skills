import {useEffect, useMemo, useState} from 'react';
import {Button, SegmentedRadioGroup, Select, Switch, Text} from '@gravity-ui/uikit';
import {VisualizationWidget} from './VisualizationWidget';
import {createMonitoringData, createSalesData, summarize, toCsv} from './data';
import type {ViewMode} from './data';
import './styles.css';

const number = (value: number, digits = 0) => new Intl.NumberFormat('ru-RU', {maximumFractionDigits: digits}).format(value);
const day = (timestamp: number) => new Intl.DateTimeFormat('ru-RU', {day: 'numeric', month: 'short', timeZone: 'UTC'}).format(timestamp).replace('.', '');

export function App({onToggleTheme}: {onToggleTheme: () => void}) {
  const [mode, setMode] = useState<ViewMode>('sales');
  const [days, setDays] = useState('30');
  const [hours, setHours] = useState('24');
  const [compare, setCompare] = useState(true);
  const [live, setLive] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [refreshed, setRefreshed] = useState(false);
  const [exported, setExported] = useState(false);
  const isSales = mode === 'sales';
  const data = useMemo(() => isSales ? createSalesData(Number(days)) : createMonitoringData(Number(hours), now), [isSales, days, hours, now]);
  const stats = useMemo(() => summarize(data), [data]);
  const points = data.series[0].points;
  const first = points[0].timestamp;
  const last = points.at(-1)!.timestamp;
  const best = points.reduce((a, b) => a.value > b.value ? a : b);
  useEffect(() => {
    if (isSales || !live) return;
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => window.clearInterval(timer);
  }, [isSales, live]);
  useEffect(() => {
    if (!refreshed && !exported) return;
    const timer = window.setTimeout(() => {setRefreshed(false); setExported(false);}, 3000);
    return () => window.clearTimeout(timer);
  }, [refreshed, exported]);
  const download = () => {
    const visibleData = {...data, series: data.series.filter((s) => compare || !s.comparison)};
    const url = URL.createObjectURL(new Blob([toCsv(visibleData)], {type: 'text/csv;charset=utf-8;'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `${mode}-${new Date(first).toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
  };
  return <div className="app">
    <div className="brand-bar">
      <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><Text variant="header-1">pulse<span className="brand-dot">.</span></Text><span className="brand-divider" /><Text color="secondary" variant="body-2">Рабочее пространство</Text></div>
      <div className="account"><span className="workspace-status"><span className="status-dot" /> Все системы в норме</span><Button view="flat" size="l" onClick={onToggleTheme} aria-label="Переключить цветовую тему" title="Переключить тему">◐</Button><span className="avatar">АК</span></div>
    </div>
    <main>
      <div className="breadcrumb"><span>Рабочее пространство</span><span>/</span><span>Аналитика</span></div>
      <div className="page-heading">
        <div><div className="eyebrow">ДАННЫЕ В ФОКУСЕ</div><Text as="h1" variant="display-1">Обзор показателей</Text><Text as="p" variant="body-2" color="secondary">От бизнес-результатов до состояния систем — в одном месте.</Text></div>
        <div className="demo-label"><span className="demo-dot" /> Демо-пространство</div>
      </div>
      <section className="widget" aria-label="Виджет аналитики">
        <div className="widget-topbar">
          <SegmentedRadioGroup<ViewMode> className="mode-switch" size="l" value={mode} onUpdate={setMode} aria-label="Режим визуализации">
            <SegmentedRadioGroup.Option value="sales"><span className="mode-label"><span aria-hidden="true">↗</span> Продажи</span></SegmentedRadioGroup.Option>
            <SegmentedRadioGroup.Option value="monitoring"><span className="mode-label"><span aria-hidden="true">⌁</span> Мониторинг</span></SegmentedRadioGroup.Option>
          </SegmentedRadioGroup>
          <div className="widget-actions"><span className="updated">{isSales ? 'Данные на 5 ноября' : live ? 'Обновление каждые 10 сек' : 'Обновление на паузе'}</span><Button view="outlined" size="m" onClick={download}><span aria-hidden="true">↓</span> {exported ? 'CSV скачан' : 'Экспорт CSV'}</Button></div>
        </div>
        <div className="widget-body">
          <div className="section-heading"><div><Text as="h2" variant="header-1">{isSales ? 'Динамика продаж' : 'Производительность системы'}</Text><Text as="p" color="secondary">{isSales ? 'Выручка по всем каналам продаж' : 'Загрузка процессора · production-01'}</Text></div>
            <div className="period-select"><Select size="l" aria-label="Период графика" value={[isSales ? days : hours]} onUpdate={(value) => {if (value[0]) (isSales ? setDays : setHours)(value[0]);}} options={isSales ? [{value: '7', content: 'Последние 7 дней'}, {value: '30', content: 'Последние 30 дней'}, {value: '90', content: 'Последние 90 дней'}] : [{value: '1', content: 'Последний час'}, {value: '6', content: 'Последние 6 часов'}, {value: '24', content: 'Последние 24 часа'}]} /><Button size="l" view="outlined" aria-label="Обновить данные" title="Обновить данные" onClick={() => {setNow(Date.now()); setRefreshed(true);}}><span className="refresh-symbol">↻</span></Button></div>
          </div>
          <div className="metrics">
            <div className="metric main-metric"><Text color="secondary" variant="body-1">{isSales ? 'Общая выручка' : 'Текущая загрузка CPU'}</Text><Text as="div" variant="display-2" className="metric-value">{number(isSales ? stats.total : stats.last, isSales ? 0 : 1)}<span className="unit"> {data.unit}</span></Text><div className="metric-note"><span className="growth">{isSales ? `↗ ${number(stats.growth, 1)}%` : '● В норме'}</span><span>{isSales ? 'к предыдущему периоду' : 'порог предупреждения — 85%'}</span></div></div>
            <div className="metric"><Text color="secondary">{isSales ? 'В среднем за день' : 'Средняя загрузка'}</Text><Text as="div" variant="header-1" className="metric-value">{number(stats.average, isSales ? 0 : 1)}<span className="unit"> {data.unit}</span></Text><Text color="secondary" variant="caption-2">{isSales ? `за ${days} дней` : 'за выбранный период'}</Text></div>
            <div className="metric"><Text color="secondary">{isSales ? 'Лучший день' : 'Пиковая нагрузка'}</Text><Text as="div" variant="header-1" className="metric-value">{number(stats.max, isSales ? 0 : 1)}<span className="unit"> {data.unit}</span></Text><Text color="secondary" variant="caption-2">{isSales ? day(best.timestamp) : new Date(best.timestamp).toLocaleTimeString('ru-RU', {timeZone: 'UTC'}) + ' UTC'}</Text></div>
          </div>
          <div className="chart-toolbar"><div className="legend"><span><i className="legend-line" />{isSales ? 'Текущий период' : 'Загрузка CPU'}</span>{isSales && compare && <span><i className="legend-line previous" />Предыдущий период</span>}</div><Switch size="m" checked={isSales ? compare : live} onUpdate={isSales ? setCompare : setLive}>{isSales ? 'Сравнить с прошлым периодом' : 'Автообновление'}</Switch></div>
          <div className="axis-caption">{isSales ? 'Выручка, ₽' : 'Загрузка CPU, %'}</div>
          <VisualizationWidget mode={mode} data={data} showComparison={compare} />
          <div className="chart-context"><span>{isSales ? `${day(first)} — ${day(last)} 2026` : 'Выделите область для увеличения · двойной клик для сброса'}</span><span>{isSales ? 'По дням' : 'Шаг 10 секунд'}<span className="context-dot">·</span>UTC</span></div>
          <div className="insight"><span className="insight-icon" aria-hidden="true">{isSales ? '↗' : '✓'}</span><div><Text variant="subheader-1">{isSales ? 'Продажи набирают темп' : 'Система работает стабильно'}</Text><Text as="p" color="secondary">{isSales ? <>Выручка выросла на <strong>{number(stats.growth, 1)}%</strong> относительно прошлого периода. Лучший результат — <strong>{day(best.timestamp)}</strong>.</> : <>Средняя загрузка — <strong>{number(stats.average, 1)}%</strong>. Все {number(stats.count)} измерений ниже порога предупреждения.</>}</Text></div></div>
        </div>
        <div className="widget-footer"><span><span className="status-dot" />{refreshed ? 'Данные обновлены' : 'Данные актуальны'}<span className="context-dot">·</span>{number(stats.count)} {isSales ? 'точек на ряд' : 'измерений'}</span><span>Источник: демонстрационные данные</span></div>
      </section>
      <div className="page-footer"><span>Меньше шума. Больше понимания.</span><span>pulse analytics <span className="footer-plus">✳</span></span></div>
      <div className="sr-only" role="status" aria-live="polite">{refreshed ? 'Данные обновлены' : exported ? 'CSV-файл скачан' : ''}</div>
    </main>
  </div>;
}
