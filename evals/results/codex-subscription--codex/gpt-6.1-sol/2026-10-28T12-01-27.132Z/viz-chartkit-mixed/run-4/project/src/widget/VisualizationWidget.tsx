import { Component, lazy, Suspense, type ReactNode } from "react";
import type { VisualizationWidgetProps } from "./types";

// Each adapter and its engine become a separate chunk. Switching mode is the only
// operation that requests the other engine; there are no eager engine imports.
const SalesChart = lazy(() => import("./engines/SalesChart"));
const MonitoringChart = lazy(() => import("./engines/MonitoringChart"));

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
      <div className="chart-message" role="alert">
        Не удалось загрузить график.
        <button className="button" onClick={() => window.location.reload()}>
          Повторить
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}

export function VisualizationWidget({
  mode,
  loading,
  ...props
}: VisualizationWidgetProps) {
  const Engine = mode === "sales" ? SalesChart : MonitoringChart;
  if (!props.series.some((series) => series.points.length))
    return (
      <div className="chart-message" style={{ height: props.height }}>
        Нет данных за выбранный период
      </div>
    );
  return (
    <div
      className="visualization"
      role="group"
      aria-label={mode === "sales" ? "График продаж" : "График мониторинга"}
      aria-busy={loading}
    >
      <ChartBoundary key={mode}>
        <Suspense
          fallback={
            <div className="chart-message" style={{ height: props.height }}>
              <span className="spinner" />
              Загружаем график…
            </div>
          }
        >
          <Engine {...props} />
        </Suspense>
      </ChartBoundary>
    </div>
  );
}
