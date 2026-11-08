import { Component, lazy, Suspense, type ReactNode } from "react";
export type Point = { x: number; y: number };
export type Series = {
  id: string;
  label: string;
  color: string;
  data: Point[];
  dashed?: boolean;
};
export type ChartProps = {
  series: Series[];
  unit: string;
  formatX: (x: number) => string;
  formatY: (y: number) => string;
};
export type VisualizationProps = ChartProps & { mode: "sales" | "monitoring" };
const SalesEngine = lazy(() => import("../engines/SalesEngine"));
const MonitoringEngine = lazy(() => import("../engines/MonitoringEngine"));
class ChartBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  state = { error: false };
  static getDerivedStateFromError() {
    return { error: true };
  }
  render() {
    return this.state.error ? (
      <div className="chart-loading">
        Не удалось загрузить график.{" "}
        <button
          className="text-button"
          onClick={() => window.location.reload()}
        >
          Попробовать снова
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
/** Common widget API. Engine code is fetched only when its mode is rendered. */
export function Visualization({ mode, ...props }: VisualizationProps) {
  const Engine = mode === "sales" ? SalesEngine : MonitoringEngine;
  return (
    <ChartBoundary key={mode}>
      <Suspense
        fallback={
          <div className="chart-loading">
            <span className="spinner" />
            Загружаем график…
          </div>
        }
      >
        <Engine
          {...props}
          series={props.series.filter((s) => s.data.length > 0)}
        />
      </Suspense>
    </ChartBoundary>
  );
}
