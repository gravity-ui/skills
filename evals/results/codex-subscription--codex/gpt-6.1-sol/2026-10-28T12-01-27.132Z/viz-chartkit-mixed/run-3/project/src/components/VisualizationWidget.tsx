import {Component, lazy, Suspense, useState, type ReactNode} from 'react';
import {Icon} from './Icon';
import type {VisualizationWidgetProps} from './charts/types';

const SalesEngine = lazy(() => import('./charts/SalesEngine'));
const MonitoringEngine = lazy(() => import('./charts/MonitoringEngine'));
class ChartBoundary extends Component<{children: ReactNode}, {failed: boolean}> {
  state = {failed: false};
  static getDerivedStateFromError() {return {failed: true};}
  render() {return this.state.failed ? <div className="chart-loading">Не удалось загрузить график. <button className="text-button" onClick={() => window.location.reload()}>Обновить страницу</button></div> : this.props.children;}
}
export function VisualizationWidget({mode, onModeChange, range, onRangeChange, data, loading}: VisualizationWidgetProps) {
  const [comparison, setComparison] = useState(true);
  const isSales = mode === 'sales';
  const Engine = isSales ? SalesEngine : MonitoringEngine;
  const color = isSales ? '#df9b47' : '#5f9480';
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const previousTotal = data.reduce((sum, d) => sum + d.comparison, 0);
  const growth = previousTotal ? (total / previousTotal - 1) * 100 : 0;
  const value = !data.length ? '—' : isSales ? `${Math.round(total).toLocaleString('ru-RU')} ₽` : `${Math.round(total / data.length)} мс`;
  return <section className="panel visualization-widget" aria-label="Виджет визуализации">
    <div className="widget-top"><div className="mode-switch" role="tablist" aria-label="Режим графика"><button role="tab" aria-selected={isSales} className={isSales ? 'selected' : ''} onClick={() => onModeChange('sales')}><Icon name="chart" size={17}/>Продажи</button><button role="tab" aria-selected={!isSales} className={!isSales ? 'selected' : ''} onClick={() => onModeChange('monitoring')}><Icon name="pulse" size={17}/>Мониторинг</button></div><div className="widget-hint"><span className="status-dot"/>Данные актуальны</div></div>
    <div className="widget-heading"><div><h2>{isSales ? 'Динамика продаж' : 'Время отклика'}</h2><p>{isSales ? 'Выручка и её изменение за выбранный период' : 'Производительность API в реальном времени'}</p></div><div className="range-switch" aria-label="Период">{(['7d', '30d', '90d'] as const).map(r => <button key={r} aria-pressed={range === r} className={range === r ? 'selected' : ''} onClick={() => onRangeChange(r)}>{r === '7d' ? (isSales ? '7 дней' : '1 час') : r === '30d' ? (isSales ? '30 дней' : '6 часов') : (isSales ? '90 дней' : '24 часа')}</button>)}</div></div>
    <div className="chart-summary"><strong>{value}</strong><span className={`growth ${!isSales ? 'neutral-growth' : ''}`}><Icon name={isSales ? 'arrow' : 'check'} size={13}/>{isSales ? `+${growth.toFixed(1).replace('.', ',')}%` : 'В пределах нормы'}</span><span className="versus">{isSales ? 'к предыдущему периоду' : 'SLA < 500 мс'}</span></div>
    <div className="chart-container" role="tabpanel" aria-label={isSales ? 'Продажи' : 'Мониторинг'}><ChartBoundary key={mode}><Suspense fallback={<div className="chart-loading"><span className="spinner"/>Загружаем график…</div>}>{loading ? <div className="chart-loading">Обновляем данные…</div> : data.length ? <Engine data={data} comparison={comparison} color={color} formatValue={v => isSales ? `${Math.round(v).toLocaleString('ru-RU')} ₽` : `${Math.round(v)} мс`}/> : <div className="chart-loading">За этот период данных пока нет</div>}</Suspense></ChartBoundary></div>
    <div className="widget-footer"><div className="chart-legend"><span><i style={{background: color}}/>{isSales ? 'Текущий период' : 'Время отклика'}</span><button onClick={() => setComparison(!comparison)} aria-pressed={comparison} className={!comparison ? 'muted-legend' : ''}><i className="dashed-legend"/>Предыдущий период</button></div><span className="data-count"><Icon name="layers" size={13}/>{data.length.toLocaleString('ru-RU')} {isSales ? 'точек данных' : 'измерений'}</span></div>
  </section>;
}
