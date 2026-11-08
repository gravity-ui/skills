import {Suspense, lazy, useState} from 'react';

const SalesChart = lazy(() => import('./charts/SalesChart'));
const MonitoringChart = lazy(() => import('./charts/MonitoringChart'));

export type ChartPoint = {time: string; value: number};
export type VisualizationMode = 'sales' | 'monitoring';
type Props = {title: string; subtitle?: string; salesData: ChartPoint[]; monitoringData: ChartPoint[]};

export function VisualizationWidget({title, subtitle, salesData, monitoringData}: Props) {
  const [mode, setMode] = useState<VisualizationMode>('sales');
  const isSales = mode === 'sales';
  const activeData = isSales ? salesData : monitoringData;
  const latest = activeData.at(-1)?.value ?? 0;
  return <section className="chart-card" aria-labelledby="visualization-title">
    <div className="chart-header"><div><h2 id="visualization-title">{title}</h2>{subtitle && <p>{subtitle}</p>}</div><div className="chart-actions"><div className="mode-switch" role="tablist" aria-label="Режим визуализации">
      <button role="tab" aria-selected={isSales} className={isSales ? 'mode-active' : ''} onClick={() => setMode('sales')}><span className="tab-glyph">⌁</span> Продажи</button>
      <button role="tab" aria-selected={!isSales} className={!isSales ? 'mode-active' : ''} onClick={() => setMode('monitoring')}><span className="tab-glyph">▦</span> Мониторинг</button>
    </div><button className="icon-button" aria-label="Дополнительные действия">···</button></div></div>
    <div className="chart-summary"><div><span className="summary-label">{isSales ? 'Продажи за сегодня' : 'Средняя нагрузка'}</span><div className="summary-value">{isSales ? '₽ 76 420' : `${latest.toFixed(1)}%`} <span className="summary-change">↑ 12,8%</span></div></div><div className="chart-legend"><span className="legend-dot primary"/>{isSales ? 'Выручка' : 'CPU'}{!isSales && <><span className="legend-dot secondary"/>Память<span className="legend-dash"/>Порог</>}</div></div>
    <div className="plot-area" key={mode}><Suspense fallback={<div className="chart-loading">Загружаем визуализацию…</div>}>{isSales ? <SalesChart data={salesData}/> : <MonitoringChart data={monitoringData}/>}</Suspense></div>
  </section>;
}
