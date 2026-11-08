import { Component, lazy, Suspense, useState, type ReactNode } from "react";
import { Icon } from "./icons";
export type ChartMode = "sales" | "monitoring";
export type ChartPoint = { time: number; value: number; comparison: number };
export type ChartSeries = { name: string; color: string; visible: boolean };
export interface ChartEngineProps {
  data: ChartPoint[];
  series: ChartSeries[];
  granularity: string;
  unit: string;
}
export interface VisualizationWidgetProps {
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  data: ChartPoint[];
  periodLabel: string;
  refreshing?: boolean;
  onExport: () => void;
  onRefresh: () => void;
}
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
          Попробовать ещё раз
        </button>
      </div>
    ) : (
      this.props.children
    );
  }
}
export function VisualizationWidget({
  mode,
  onModeChange,
  data,
  periodLabel,
  refreshing,
  onExport,
  onRefresh,
}: VisualizationWidgetProps) {
  const [granularities, setGranularities] = useState({
    sales: "День",
    monitoring: "1 с",
  });
  const granularity = granularities[mode];
  const [visible, setVisible] = useState([true, true]);
  const [expanded, setExpanded] = useState(false);
  const [menu, setMenu] = useState(false);
  const monitoring = mode === "monitoring";
  const series = [
    {
      name: monitoring ? "API · основной" : "Текущий период",
      color: "#8b5cf6",
      visible: visible[0],
    },
    {
      name: monitoring ? "API · резервный" : "Предыдущий период",
      color: "#b5bacb",
      visible: visible[1],
    },
  ];
  return (
    <section className={`chart-card ${expanded ? "chart-expanded" : ""}`}>
      <div className="widget-top">
        <div
          className="mode-switch"
          role="tablist"
          aria-label="Тип визуализации"
        >
          <button
            role="tab"
            aria-selected={!monitoring}
            className={!monitoring ? "selected" : ""}
            onClick={() => onModeChange("sales")}
          >
            <Icon name="chart" size={17} />
            Продажи
          </button>
          <button
            role="tab"
            aria-selected={monitoring}
            className={monitoring ? "selected" : ""}
            onClick={() => onModeChange("monitoring")}
          >
            <Icon name="activity" size={17} />
            Мониторинг
            <span className="live-dot" />
          </button>
        </div>
        <div className="widget-actions">
          <button className="button small" onClick={onExport}>
            <Icon name="download" size={16} />
            <span>Экспорт</span>
          </button>
          <div className="popover-anchor">
            <button
              className="icon-button"
              aria-label="Меню графика"
              onClick={() => setMenu(!menu)}
            >
              <Icon name="more" />
            </button>
            {menu && (
              <div className="dropdown chart-menu">
                <button
                  onClick={() => {
                    setExpanded(!expanded);
                    setMenu(false);
                  }}
                >
                  <Icon name="expand" size={16} />
                  {expanded ? "Свернуть график" : "На весь экран"}
                </button>
                <button
                  onClick={() => {
                    onRefresh();
                    setMenu(false);
                  }}
                >
                  <Icon name="refresh" size={16} />
                  Обновить данные
                </button>
              </div>
            )}
          </div>
          {expanded && (
            <button
              className="icon-button"
              onClick={() => setExpanded(false)}
              aria-label="Свернуть"
            >
              <Icon name="close" />
            </button>
          )}
        </div>
      </div>
      <div className="chart-heading">
        <div>
          <h2>
            {monitoring ? "Мониторинг в реальном времени" : "Динамика продаж"}
            <span
              className="info"
              title={
                monitoring
                  ? "Время ответа сервисов, миллисекунды"
                  : "Выручка за выбранный период, в рублях"
              }
            >
              i
            </span>
          </h2>
          <p>
            {monitoring
              ? "Время ответа сервисов · последние 60 минут"
              : `Выручка за ${periodLabel.toLowerCase()} в сравнении с предыдущим периодом`}
          </p>
        </div>
        <div className="granularity">
          {(monitoring
            ? ["1 с", "5 с", "15 с"]
            : ["День", "Неделя", "Месяц"]
          ).map((item) => (
            <button
              key={item}
              className={granularity === item ? "active" : ""}
              onClick={() => setGranularities((v) => ({ ...v, [mode]: item }))}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="legend">
        {series.map((s, i) => (
          <button
            key={s.name}
            className={!s.visible ? "disabled-series" : ""}
            onClick={() =>
              setVisible((v) => v.map((x, j) => (j === i ? !x : x)))
            }
            aria-pressed={s.visible}
          >
            <span style={{ background: s.color }} />
            {s.name}
          </button>
        ))}
        {monitoring && (
          <span className="monitoring-live">
            <span className="live-dot" />В реальном времени
          </span>
        )}
      </div>
      <div className={`chart-container ${refreshing ? "is-refreshing" : ""}`}>
        <ChartBoundary key={mode}>
          <Suspense
            fallback={
              <div className="chart-loading">
                <span className="loader" />
                Загружаем график…
              </div>
            }
          >
            {monitoring ? (
              <MonitoringEngine
                data={data}
                series={series}
                granularity={granularity}
                unit="мс"
              />
            ) : (
              <SalesEngine
                data={data}
                series={series}
                granularity={granularity}
                unit="₽"
              />
            )}
          </Suspense>
        </ChartBoundary>
      </div>
      <div className="chart-footer">
        <span>
          <span className="live-dot" />
          {refreshing ? "Обновляем данные…" : "Все данные актуальны"}
          <span className="update-caption">
            <span className="footer-separator">·</span>Обновлено только что
          </span>
        </span>
        <span className="engine-label">
          <Icon name={monitoring ? "activity" : "chart"} size={14} />
          {monitoring
            ? `${data.length.toLocaleString("ru-RU")} точек · uPlot`
            : `${data.length} точек · Recharts`}
        </span>
      </div>
    </section>
  );
}
