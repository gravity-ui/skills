import {lazy, Suspense, useState} from 'react';
import './styles.css';

type ViewMode = 'sales' | 'monitoring';
type Point = {time: string; value: number};

const SalesChart = lazy(() => import('./charts/SalesChart'));
const MonitoringChart = lazy(() => import('./charts/MonitoringChart'));

const sales: Point[] = [
  {time: '01 Jun', value: 34}, {time: '03 Jun', value: 40}, {time: '05 Jun', value: 37},
  {time: '07 Jun', value: 51}, {time: '09 Jun', value: 46}, {time: '11 Jun', value: 59},
  {time: '13 Jun', value: 54}, {time: '15 Jun', value: 67}, {time: '17 Jun', value: 61},
  {time: '19 Jun', value: 77}, {time: '21 Jun', value: 71}, {time: '23 Jun', value: 83},
  {time: '25 Jun', value: 75}, {time: '27 Jun', value: 93}, {time: '29 Jun', value: 88},
];

const monitoring: Point[] = Array.from({length: 1400}, (_, i) => {
  const baseline = 58 + Math.sin(i / 37) * 8 + Math.sin(i / 8) * 3;
  const pulse = i % 193 > 184 ? (i % 193 - 184) * 5 : 0;
  const noise = Math.sin(i * 12.9898) * 2.2 + Math.cos(i * 0.73) * 1.3;
  return {time: `${String(Math.floor(i / 60) % 24).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}`, value: Math.max(22, Math.min(98, baseline + pulse + noise))};
});

export function ChartWidget({mode, onModeChange, salesData, monitoringData}: {
  mode: ViewMode; onModeChange: (mode: ViewMode) => void; salesData: Point[]; monitoringData: Point[];
}) {
  return <section className="chart-card" aria-label="Визуализация данных">
    <div className="chart-topline">
      <div className="heading-block">
        <div className="eyebrow">АНАЛИТИКА · ИЮНЬ 2025</div>
        <h1>{mode === 'sales' ? 'Динамика продаж' : 'Мониторинг системы'}</h1>
        <p>{mode === 'sales' ? 'Выручка по дням за последние 30 дней' : 'Плотность запросов · последние 24 часа'}</p>
      </div>
      <div className="mode-switch" role="tablist" aria-label="Режим графика">
        <button role="tab" aria-selected={mode === 'sales'} className={mode === 'sales' ? 'active' : ''} onClick={() => onModeChange('sales')}>
          <span className="tab-icon sales-icon">⌁</span> Продажи
        </button>
        <button role="tab" aria-selected={mode === 'monitoring'} className={mode === 'monitoring' ? 'active' : ''} onClick={() => onModeChange('monitoring')}>
          <span className="tab-icon monitor-icon">▥</span> Мониторинг
        </button>
      </div>
    </div>
    <div className="metric-row">
      <div className="metric"><span className="metric-label">{mode === 'sales' ? 'ОБЩАЯ ВЫРУЧКА' : 'СРЕДНЯЯ НАГРУЗКА'}</span><strong>{mode === 'sales' ? '₽ 2,48 млн' : '62,4%'}</strong><span className="metric-change"><b>↗</b> 12,8% <i>к прошлому периоду</i></span></div>
      <div className="metric-divider" />
      <div className="metric secondary-metric"><span className="metric-label">{mode === 'sales' ? 'СРЕДНИЙ ЧЕК' : 'ПИК ЗАПРОСОВ'}</span><strong>{mode === 'sales' ? '₽ 4 820' : '1 284 / мин'}</strong><span className="metric-sub">{mode === 'sales' ? 'за выбранный период' : 'сегодня, в 14:32'}</span></div>
      <div className="period-pill"><span className="calendar-icon">▦</span> {mode === 'sales' ? '1 – 30 июня' : 'Последние 24 часа'} <span className="chevron">⌄</span></div>
    </div>
    <div className="chart-area">
      <div className="chart-legend"><span className={`legend-dot ${mode}`} />{mode === 'sales' ? 'Выручка' : 'Загрузка CPU'}<span className="unit">{mode === 'sales' ? 'млн ₽' : '%'}</span></div>
      <Suspense fallback={<div className="chart-loading"><span className="spinner" />Загружаем визуализацию…</div>}>
        {mode === 'sales' ? <SalesChart data={salesData} /> : <MonitoringChart data={monitoringData} />}
      </Suspense>
    </div>
    <footer className="chart-footer"><span><i className="live-dot" /> Данные обновлены только что</span><button className="export-button" onClick={() => {}}>Скачать отчёт <span>↓</span></button></footer>
  </section>;
}

export function App() {
  const [mode, setMode] = useState<ViewMode>('sales');
  return <main className="page-shell">
    <header className="app-header"><a className="brand" href="#"><span className="brand-mark">◈</span> pulse<span className="brand-light">/</span>data</a><nav><a className="nav-active" href="#">Обзор</a><a href="#">Отчёты</a><a href="#">Источники</a></nav><div className="user-area"><button className="help-button" aria-label="Помощь">?</button><span className="avatar">АК</span><span className="user-name">Алексей К.</span><span className="chevron">⌄</span></div></header>
    <div className="content-wrap"><div className="breadcrumb">Рабочее пространство <span>/</span> Обзор</div><div className="page-title-row"><div><h2>Обзор данных</h2><p>Следите за ключевыми показателями в одном месте</p></div><button className="range-button"><span>▦</span> Последние 30 дней <span className="chevron">⌄</span></button></div>
      <ChartWidget mode={mode} onModeChange={setMode} salesData={sales} monitoringData={monitoring} />
      <div className="under-note"><span className="sparkle">✳</span> Переключайтесь между бизнес-показателями и техническим мониторингом в одном виджете.</div>
    </div>
    <div className="page-orb orb-one"/><div className="page-orb orb-two"/>
  </main>;
}
