import {lazy, Suspense, useState} from 'react';
import './styles.css';

export type ChartMode = 'sales' | 'monitoring';
export type SalesPoint = {label: string; value: number};
export type MonitoringPoint = {timestamp: number; value: number};

type SharedChartProps = {
  height: number;
  className?: string;
};

const SalesChart = lazy(() => import('./charts/SalesChart'));
const MonitoringChart = lazy(() => import('./charts/MonitoringChart'));

const salesData: SalesPoint[] = [
  {label: 'Янв', value: 2.8}, {label: 'Фев', value: 3.2}, {label: 'Мар', value: 3.05},
  {label: 'Апр', value: 4.1}, {label: 'Май', value: 3.8}, {label: 'Июн', value: 4.65},
  {label: 'Июл', value: 4.3}, {label: 'Авг', value: 5.2}, {label: 'Сен', value: 4.95},
  {label: 'Окт', value: 6.15}, {label: 'Ноя', value: 5.7}, {label: 'Дек', value: 7.3},
];

const monitoringData: MonitoringPoint[] = Array.from({length: 1200}, (_, index) => {
  const trend = 57 + Math.sin(index / 110) * 5;
  const wave = Math.sin(index / 5.8) * 6 + Math.sin(index / 2.3) * 2.2;
  const spike = (index > 825 && index < 838 ? 20 : 0) + (index > 1010 && index < 1014 ? 15 : 0);
  const noise = Math.sin(index * 12.9898) * Math.cos(index * 4.1414) * 3.2;
  return {timestamp: Date.now() - (1199 - index) * 60_000, value: Math.max(25, trend + wave + spike + noise)};
});

export type ChartEngineProps = SharedChartProps & {
  data: SalesPoint[] | MonitoringPoint[];
};

type VisualizationWidgetProps = {
  initialMode?: ChartMode;
  mode?: ChartMode;
  onModeChange?: (mode: ChartMode) => void;
  sales?: SalesPoint[];
  monitoring?: MonitoringPoint[];
};

function Icon({name}: {name: 'chart' | 'pulse' | 'calendar' | 'download' | 'more' | 'arrow'}) {
  const common = {width: 18, height: 18, viewBox: '0 0 18 18', fill: 'none', 'aria-hidden': true as const};
  if (name === 'pulse') return <svg {...common}><path d="M2 9h3l2-5 3.5 10 2-5H16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  if (name === 'calendar') return <svg {...common}><rect x="2.25" y="3.75" width="13.5" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/><path d="M5.5 2v3.5M12.5 2v3.5M2.5 7.5h13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>;
  if (name === 'download') return <svg {...common}><path d="M9 2.5v8m0 0 3-3m-3 3-3-3M3 12.5v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  if (name === 'more') return <svg {...common}><circle cx="3.5" cy="9" r="1" fill="currentColor"/><circle cx="9" cy="9" r="1" fill="currentColor"/><circle cx="14.5" cy="9" r="1" fill="currentColor"/></svg>;
  if (name === 'arrow') return <svg {...common}><path d="m4 11 3.2-3.2 2.4 2.4L14 5.8M10.5 5.8H14v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
  return <svg {...common}><path d="M2 14.5 6.25 10l3 2.5 6.75-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 2.5v13h14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>;
}

export function VisualizationWidget({initialMode = 'sales', mode: controlledMode, onModeChange, sales = salesData, monitoring = monitoringData}: VisualizationWidgetProps) {
  const [localMode, setLocalMode] = useState<ChartMode>(initialMode);
  const mode = controlledMode ?? localMode;
  const changeMode = (nextMode: ChartMode) => {
    if (controlledMode === undefined) setLocalMode(nextMode);
    onModeChange?.(nextMode);
  };
  const isSales = mode === 'sales';
  const data = isSales ? sales : monitoring;

  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#overview" aria-label="Пульс — главная"><span className="brand-mark"><Icon name="pulse" /></span><span>пульс<span className="brand-dot">.</span></span></a>
      <nav className="top-nav" aria-label="Главная навигация"><a className="nav-item active" href="#overview">Обзор</a><a className="nav-item" href="#reports">Отчёты</a><a className="nav-item" href="#integrations">Интеграции</a></nav>
      <div className="top-actions"><button className="icon-button help-button" aria-label="Справка">?</button><div className="avatar" aria-label="Профиль Анны">АК</div></div>
    </header>

    <div className="page-content" id="overview">
      <div className="breadcrumb"><span>Рабочее пространство</span><span className="crumb-separator">/</span><strong>Обзор</strong></div>
      <div className="page-heading"><div><p className="eyebrow">СРЕДА, 4 НОЯБРЯ 2026</p><h1>Доброе утро, Анна <span className="wave">✳</span></h1><p className="heading-subtitle">Вот что происходит с вашим бизнесом сегодня.</p></div><button className="date-button"><Icon name="calendar"/><span>Последние 12 месяцев</span><span className="chevron">⌄</span></button></div>

      <section className="metric-grid" aria-label="Ключевые показатели">
        <article className="metric-card"><div className="metric-top"><span className="metric-label">Выручка</span><span className="metric-symbol mint">₽</span></div><div className="metric-value">₽ 5,42 млн</div><div className="metric-foot"><span className="trend up"><Icon name="arrow"/> 12,8%</span><span>к прошлому периоду</span></div></article>
        <article className="metric-card"><div className="metric-top"><span className="metric-label">Заказы</span><span className="metric-symbol lilac">↗</span></div><div className="metric-value">1 284</div><div className="metric-foot"><span className="trend up"><Icon name="arrow"/> 8,2%</span><span>к прошлому периоду</span></div></article>
        <article className="metric-card"><div className="metric-top"><span className="metric-label">Средний чек</span><span className="metric-symbol peach">◉</span></div><div className="metric-value">₽ 4 221</div><div className="metric-foot"><span className="trend down"><Icon name="arrow"/> 2,4%</span><span>к прошлому периоду</span></div></article>
        <article className="metric-card"><div className="metric-top"><span className="metric-label">Конверсия</span><span className="metric-symbol blue">◎</span></div><div className="metric-value">3,86%</div><div className="metric-foot"><span className="trend up"><Icon name="arrow"/> 0,6%</span><span>к прошлому периоду</span></div></article>
      </section>

      <section className="chart-card" aria-labelledby="chart-heading">
        <div className="chart-header"><div><div className="section-kicker"><span className={`status-dot ${isSales ? '' : 'monitoring-dot'}`}></span>{isSales ? 'ПОКАЗАТЕЛИ ПРОДАЖ' : 'СИСТЕМНЫЙ МОНИТОРИНГ'}</div><h2 id="chart-heading">{isSales ? 'Динамика продаж' : 'Нагрузка системы'}</h2><p className="chart-description">{isSales ? 'Выручка по месяцам за выбранный период' : 'Загрузка CPU за последние 20 часов · шаг 1 минута'}</p></div><div className="chart-actions"><button className="outline-button export-button"><Icon name="download"/>Экспорт</button><button className="icon-button more-button" aria-label="Дополнительные действия"><Icon name="more"/></button></div></div>
        <div className="chart-toolbar"><div className="mode-switch" role="tablist" aria-label="Режим визуализации"><button role="tab" aria-selected={isSales} className={isSales ? 'selected' : ''} onClick={() => changeMode('sales')}><Icon name="chart"/>Продажи</button><button role="tab" aria-selected={!isSales} className={!isSales ? 'selected' : ''} onClick={() => changeMode('monitoring')}><Icon name="pulse"/>Мониторинг</button></div><div className="period-switch" aria-label="Период графика"><button className="period-active">1Д</button><button>1Н</button><button>1М</button><button>1Г</button></div></div>
        <div className={`chart-plot ${isSales ? 'sales-plot' : 'monitoring-plot'}`}>
          <Suspense fallback={<div className="chart-loading"><span className="loading-spinner"/>Загружаем визуализацию…</div>}>
            {isSales ? <SalesChart data={data as SalesPoint[]} height={310} className="sales-engine"/> : <MonitoringChart data={data as MonitoringPoint[]} height={310} className="monitoring-engine"/>}
          </Suspense>
        </div>
        <div className="chart-footer"><div className="legend"><span className={`legend-line ${isSales ? 'sales-legend' : 'monitoring-legend'}`}></span><span>{isSales ? 'Выручка' : 'Загрузка CPU'}</span>{!isSales && <><span className="legend-dash"></span><span>Порог предупреждения</span></>}</div><div className="updated"><span className="live-dot"></span>{isSales ? 'Данные обновлены 5 минут назад' : 'Обновление в реальном времени'}</div></div>
      </section>

      <div className="bottom-note"><span className="sparkle">✦</span><span><strong>Всё под контролем.</strong> Показатели в норме, так держать.</span><button aria-label="Закрыть уведомление">×</button></div>
      <footer className="page-footer"><span>© 2025 Пульс Аналитика</span><div><a href="#help">Помощь</a><a href="#status">Статус системы <span className="live-dot"></span></a></div></footer>
    </div>
  </main>;
}

export function App() {
  return <VisualizationWidget />;
}
