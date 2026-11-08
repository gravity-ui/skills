import { Component, lazy, Suspense, type ReactNode } from 'react';

export type ChartPoint = { timestamp: number; value: number; previous: number };
export type ChartMode = 'sales' | 'monitoring';
export type ChartEngineProps = {
  data: ChartPoint[];
  height?: number;
  comparison?: boolean;
  visible?: boolean;
  onPointSelect?: (point: ChartPoint) => void;
};
export type ChartWidgetProps = ChartEngineProps & { mode: ChartMode };
const SalesEngine = lazy(() => import('../engines/SalesEngine'));
const MonitoringEngine = lazy(() => import('../engines/MonitoringEngine'));

class ChartErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return <div className="chart-state">Не удалось загрузить график.<button className="button" onClick={() => window.location.reload()}>Попробовать снова</button></div>;
    return this.props.children;
  }
}

/** A single data and interaction contract for independently loaded SVG and Canvas engines. */
export function ChartWidget({ mode, height = 300, ...props }: ChartWidgetProps) {
  const Engine = mode === 'sales' ? SalesEngine : MonitoringEngine;
  return <div className="chart-widget" style={{ height }} aria-label={mode === 'sales' ? 'График выручки' : 'График времени отклика'}>
    <ChartErrorBoundary key={mode}>
      <Suspense fallback={<div className="chart-state" role="status"><span className="loader" />Загружаем график…</div>}>
        {props.data.length ? <Engine {...props} height={height} /> : <div className="chart-state">Нет данных за выбранный период</div>}
      </Suspense>
    </ChartErrorBoundary>
  </div>;
}
