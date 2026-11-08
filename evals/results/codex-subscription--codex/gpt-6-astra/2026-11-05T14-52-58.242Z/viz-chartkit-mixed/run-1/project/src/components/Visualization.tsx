import { Component, lazy, Suspense, type ReactNode } from "react";
export type Point = { time: number; value: number; previous?: number };
export type ChartMode = "sales" | "monitoring";
export interface ChartProps {
  data: Point[];
  comparison: boolean;
  color?: string;
  onHover?: (point: Point | null) => void;
}
export interface VisualizationProps extends ChartProps {
  mode: ChartMode;
}
const SalesEngine = lazy(() => import("../engines/SalesEngine"));
const MonitoringEngine = lazy(() => import("../engines/MonitoringEngine"));
class ChartBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="chart-loading">
        Не удалось загрузить график.{" "}
        <button onClick={() => location.reload()}>Повторить</button>
      </div>
    ) : (
      this.props.children
    );
  }
}
/** Both rendering engines implement ChartProps and are loaded only on demand. */
export function Visualization({ mode, ...props }: VisualizationProps) {
  const Engine = mode === "sales" ? SalesEngine : MonitoringEngine;
  if (!props.data.length)
    return <div className="chart-loading">За выбранный период нет данных.</div>;
  return (
    <ChartBoundary key={mode}>
      <Suspense
        fallback={
          <div className="chart-loading">
            <span className="loader" />
            Загружаем график…
          </div>
        }
      >
        <Engine {...props} />
      </Suspense>
    </ChartBoundary>
  );
}
