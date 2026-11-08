import {Component, lazy, Suspense, type ReactNode} from 'react';

export type ChartMode = 'sales' | 'monitoring';
export interface ChartSeries {id: string; name: string; color: string; values: number[]; dashed?: boolean}
export interface ChartData {timestamps: number[]; series: ChartSeries[]}
export interface ChartWidgetProps {
  mode: ChartMode;
  data: ChartData;
  height?: number;
  showGrid?: boolean;
  unit?: string;
}
const engines = {
  sales: lazy(() => import('../engines/SalesEngine')),
  monitoring: lazy(() => import('../engines/MonitoringEngine')),
};
class ChartErrorBoundary extends Component<{children: ReactNode}, {error: boolean}> {
  state = {error: false};
  static getDerivedStateFromError() {return {error: true};}
  render() {return this.state.error ? <div className="chart-loading" role="alert">Не удалось загрузить график. <button className="text-button" onClick={() => window.location.reload()}>Обновить страницу</button></div> : this.props.children;}
}
/** Both engines receive the same timestamp/series contract and load on demand. */
export function ChartWidget(props: ChartWidgetProps) {
  const Engine = engines[props.mode];
  return <div className="chart-viewport" style={{height: props.height ?? 310}} aria-label={props.mode === 'sales' ? 'График продаж' : 'График мониторинга'}>
    <ChartErrorBoundary key={props.mode}>
      <Suspense fallback={<div className="chart-loading"><span className="spinner"/>Загружаем график…</div>}>
        {props.data.timestamps.length ? <Engine {...props}/> : <div className="chart-loading">Нет данных за выбранный период</div>}
      </Suspense>
    </ChartErrorBoundary>
  </div>;
}
