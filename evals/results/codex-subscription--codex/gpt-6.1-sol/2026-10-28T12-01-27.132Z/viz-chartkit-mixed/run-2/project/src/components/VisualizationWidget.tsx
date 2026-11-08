import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowDownToLine,
  ArrowUpRight,
  ChartNoAxesCombined,
  CircleHelp,
  Ellipsis,
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  X,
} from "lucide-react";
import {
  createPoints,
  money,
  periodLabels,
  type ChartMode,
  type Period,
  type ChartPoint,
} from "../charts/types";

const SalesEngine = lazy(() => import("../charts/SalesEngine"));
const MonitoringEngine = lazy(() => import("../charts/MonitoringEngine"));
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
export function exportPoints(points: ChartPoint[], mode: ChartMode) {
  const csv =
    "\uFEFFДата;" +
    (mode === "sales" ? "Продажи (₽)" : "Время ответа (мс)") +
    ";Предыдущий период\n" +
    points
      .map(
        (p) =>
          `${new Date(p.timestamp).toISOString()};${p.value};${p.previous}`,
      )
      .join("\n");
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `pulse-${mode}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
export interface VisualizationWidgetProps {
  mode: ChartMode;
  onModeChange: (mode: ChartMode) => void;
  period: Period;
  onPeriodChange: (period: Period) => void;
  endDate: number;
  multiplier?: number;
  data?: ChartPoint[];
  onDataChange?: (points: ChartPoint[]) => void;
}
export function VisualizationWidget({
  mode,
  onModeChange,
  period,
  onPeriodChange,
  endDate,
  multiplier = 1,
  data,
  onDataChange,
}: VisualizationWidgetProps) {
  const [comparison, setComparison] = useState(true);
  const [live, setLive] = useState(true);
  const [tick, setTick] = useState(0);
  const [menu, setMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [help, setHelp] = useState(false);
  useEffect(() => {
    if (mode !== "monitoring" || !live || data) return;
    const timer = window.setInterval(() => setTick((t) => t + 1), 4000);
    return () => window.clearInterval(timer);
  }, [mode, live, data]);
  useEffect(() => {
    if (!expanded) return;
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, [expanded]);
  const points = useMemo(
    () =>
      data ??
      createPoints(
        mode,
        period,
        endDate + (mode === "monitoring" ? tick * 4000 : 0),
        multiplier,
      ),
    [mode, period, endDate, tick, multiplier, data],
  );
  useEffect(() => {
    onDataChange?.(points);
  }, [points, onDataChange]);
  const total = points.reduce((s, p) => s + p.value, 0);
  const previousTotal = points.reduce((sum, point) => sum + point.previous, 0);
  const growth = previousTotal > 0 ? (total / previousTotal - 1) * 100 : 0;
  const Engine = mode === "sales" ? SalesEngine : MonitoringEngine;
  return (
    <section
      className={`chart-card panel ${expanded ? "expanded" : ""}`}
      aria-label="Виджет визуализации"
    >
      <div className="chart-heading">
        <div className="title-with-icon">
          <span className="heading-icon">
            <ChartNoAxesCombined size={18} />
          </span>
          <h2>{mode === "sales" ? "Динамика продаж" : "Мониторинг системы"}</h2>
          <button
            className="icon-button info-button"
            aria-label="О графике"
            onClick={() => setHelp(!help)}
          >
            <CircleHelp size={15} />
          </button>
        </div>
        <div className="chart-heading-actions">
          <span className="chart-freshness">
            <i />
            {mode === "monitoring"
              ? live
                ? `${points.length.toLocaleString("ru-RU")} точек · Онлайн`
                : "На паузе"
              : "Данные обновлены"}
          </span>
          <button
            className="icon-button expand-button"
            aria-label={expanded ? "Свернуть график" : "Развернуть график"}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <X size={18} /> : <Maximize2 size={16} />}
          </button>
          <div className="dropdown-anchor">
            <button
              className="icon-button"
              aria-label="Действия с графиком"
              onClick={() => setMenu(!menu)}
            >
              <Ellipsis size={21} />
            </button>
            {menu && (
              <div className="popover chart-menu">
                <button
                  onClick={() => {
                    exportPoints(points, mode);
                    setMenu(false);
                  }}
                >
                  <ArrowDownToLine size={15} />
                  Скачать CSV
                </button>
                <button
                  onClick={() => {
                    setTick((t) => t + 1);
                    setMenu(false);
                  }}
                >
                  <RefreshCw size={15} />
                  Обновить данные
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {help && (
        <div className="chart-info">
          {mode === "sales"
            ? "Выручка за выбранный период. Наведите на график, чтобы увидеть значения. Пунктирная линия показывает предыдущий период."
            : "Время ответа сервера в миллисекундах. 2 400 точек, обновление каждые 4 секунды. Выделите область графика для масштабирования."}
          <span>Демонстрационные данные.</span>
        </div>
      )}
      <div className="chart-toolbar">
        <div className="mode-switch" role="tablist" aria-label="Режим графика">
          <button
            role="tab"
            aria-selected={mode === "sales"}
            className={mode === "sales" ? "active" : ""}
            onClick={() => onModeChange("sales")}
          >
            <ChartNoAxesCombined size={15} />
            Продажи
          </button>
          <button
            role="tab"
            aria-selected={mode === "monitoring"}
            className={mode === "monitoring" ? "active" : ""}
            onClick={() => onModeChange("monitoring")}
          >
            <Activity size={15} />
            Мониторинг
          </button>
        </div>
        <div className="period-switch" aria-label="Период графика">
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              aria-pressed={period === p}
              className={period === p ? "active" : ""}
              onClick={() => onPeriodChange(p)}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>
      <div className="chart-summary">
        <div>
          <span className="small-label">
            {mode === "sales" ? "Выручка за период" : "Среднее время ответа"}
          </span>
          <div className="chart-total">
            {mode === "sales"
              ? money(total)
              : `${Math.round(total / Math.max(1, points.length))} мс`}
            <span
              className={`growth ${mode === "sales" && growth < 0 ? "negative" : ""}`}
            >
              {mode === "monitoring" ? (
                <Activity size={14} />
              ) : growth < 0 ? (
                <ArrowDownRight size={14} />
              ) : (
                <ArrowUpRight size={14} />
              )}
              {mode === "sales"
                ? `${Math.abs(growth).toLocaleString("ru-RU", { maximumFractionDigits: 1 })}%`
                : points.length.toLocaleString("ru-RU")}
            </span>
            <span className="summary-description">
              {mode === "sales" ? "к прошлому периоду" : "точек в ряду"}
            </span>
          </div>
        </div>
        {mode === "monitoring" && (
          <button className="button live-button" onClick={() => setLive(!live)}>
            {live ? <Pause size={14} /> : <Play size={14} />}{" "}
            {live ? "Пауза" : "Продолжить"}
          </button>
        )}
      </div>
      <div className="chart-canvas">
        {points.length === 0 ? (
          <div className="chart-loading">Нет данных за выбранный период</div>
        ) : (
          <ChartBoundary key={mode}>
            <Suspense
              fallback={
                <div className="chart-loading">
                  <span className="loader" />
                  Загружаем график…
                </div>
              }
            >
              <Engine points={points} comparison={comparison} />
            </Suspense>
          </ChartBoundary>
        )}
      </div>
      <div className="chart-footer">
        <div className="legend">
          <span>
            <i className="legend-line" />
            {mode === "sales" ? "Текущий период" : "Время ответа"}
          </span>
          {comparison && (
            <span>
              <i className="legend-line previous" />
              Предыдущий период
            </span>
          )}
        </div>
        <label className="compare-label">
          <input
            type="checkbox"
            checked={comparison}
            onChange={(e) => setComparison(e.target.checked)}
          />
          <span className="toggle" />
          Сравнить с прошлым периодом
        </label>
      </div>
    </section>
  );
}
