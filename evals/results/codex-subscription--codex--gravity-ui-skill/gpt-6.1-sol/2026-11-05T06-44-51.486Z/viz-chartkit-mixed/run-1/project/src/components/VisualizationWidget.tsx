import { useMemo, useState } from "react";
import ChartKit from "@gravity-ui/chartkit";
import { Button, Loader, SegmentedRadioGroup, Text } from "@gravity-ui/uikit";
import { salesConfig, monitoringConfig } from "../lib/chart-config";
import { summarize, toCsv } from "../lib/data";
import type { VisualizationWidgetProps, WidgetMode } from "../lib/types";
import "../lib/chartkit";

const number = (value: number) =>
  new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(value);
const date = (value: number) =>
  new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(value);

function ChartState({
  kind,
  message,
  retry,
}: {
  kind: "loading" | "empty" | "error";
  message?: string;
  retry?: () => void;
}) {
  return (
    <div className="chart-state" role={kind === "error" ? "alert" : "status"}>
      {kind === "loading" ? (
        <Loader size="m" />
      ) : (
        <span className="state-symbol">{kind === "empty" ? "∅" : "!"}</span>
      )}
      <Text variant="subheader-2">
        {message ??
          (kind === "loading"
            ? "Загружаем график…"
            : "Нет данных за этот период")}
      </Text>
      {retry && <Button onClick={retry}>Повторить</Button>}
    </div>
  );
}

export function VisualizationWidget({
  mode,
  onModeChange,
  data,
  range,
  onRangeChange,
  updatedAt,
  onRefresh,
  loading,
  error,
}: VisualizationWidgetProps) {
  const [hidden, setHidden] = useState<string[]>([]);
  const [retry, setRetry] = useState(0);
  const [exported, setExported] = useState(false);
  const stats = useMemo(() => summarize(data), [data]);
  const sales = mode === "sales";
  const primary = data.series.find((series) => !series.comparison);
  const peakIndex = primary?.values.indexOf(stats.max) ?? -1;
  const bestDay =
    peakIndex >= 0 && data.timeline[peakIndex] !== undefined
      ? date(data.timeline[peakIndex])
      : "Нет измерений";
  const rangeOptions = sales
    ? [
        { value: "7", content: "7 дней" },
        { value: "30", content: "30 дней" },
        { value: "90", content: "90 дней" },
      ]
    : [
        { value: "1", content: "1 час" },
        { value: "6", content: "6 часов" },
        { value: "24", content: "24 часа" },
      ];
  const chartData = useMemo(
    () => (sales ? salesConfig(data, hidden) : monitoringConfig(data, hidden)),
    [sales, data, hidden],
  );
  const empty =
    !data.timeline.length ||
    !data.series.some(
      (s) => !hidden.includes(s.id) && s.values.some((v) => v !== null),
    );
  const toggleSeries = (id: string) =>
    setHidden((current) =>
      current.includes(id) ? current.filter((x) => x !== id) : [...current, id],
    );
  const exportCsv = () => {
    const url = URL.createObjectURL(
      new Blob([toCsv(data)], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `pulse-${mode}-${range}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  return (
    <section className="visualization-widget" aria-label="Виджет визуализации">
      <div className="widget-topbar">
        <div className="mode-selector">
          <SegmentedRadioGroup<WidgetMode>
            size="l"
            value={mode}
            onUpdate={(value) => {
              setHidden([]);
              onModeChange(value);
            }}
            aria-label="Режим визуализации"
            options={[
              {
                value: "sales",
                content: (
                  <span className="mode-option">
                    <span className="line-icon" aria-hidden="true">
                      ↗
                    </span>
                    Продажи
                  </span>
                ),
              },
              {
                value: "monitoring",
                content: (
                  <span className="mode-option">
                    <span className="line-icon" aria-hidden="true">
                      ∿
                    </span>
                    Мониторинг
                  </span>
                ),
              },
            ]}
          />
        </div>
        <div className="widget-actions">
          <Button
            view="flat"
            size="m"
            onClick={onRefresh}
            disabled={!onRefresh}
            aria-label="Обновить данные"
            title="Обновить данные"
          >
            <span className="refresh-icon">↻</span>
          </Button>
          <span className="action-divider" />
          <Button
            view="outlined"
            size="m"
            onClick={exportCsv}
            disabled={!data.timeline.length}
          >
            <span className="download-icon">↓</span>
            {exported ? "Скачано" : "Экспорт"}
          </Button>
        </div>
      </div>
      <div className="widget-body">
        <div className="chart-heading">
          <div>
            <div className="chart-title-row">
              <Text variant="header-2" as="h2">
                {sales ? "Динамика продаж" : "Время ответа API"}
              </Text>
              <span className="subtle-badge">
                {sales ? "Выручка" : "Production"}
              </span>
            </div>
            <p className="chart-subtitle">
              {sales
                ? "Как менялась выручка в выбранном периоде"
                : "Каждое измерение — для полной картины работы сервиса"}
            </p>
          </div>
          <SegmentedRadioGroup
            size="m"
            value={range}
            onUpdate={onRangeChange}
            options={rangeOptions}
            aria-label="Период графика"
          />
        </div>
        <div className="kpi-row">
          <div className="kpi kpi-primary">
            <div className="kpi-label">
              {sales ? "Общая выручка" : "Среднее время ответа"}
              <span
                className="info-dot"
                title={
                  sales
                    ? "Сумма выручки за выбранный период"
                    : "Среднее всех измерений за выбранный период"
                }
              >
                i
              </span>
            </div>
            <div className="kpi-value">
              {number(sales ? stats.sum : stats.average)}
              <span className="kpi-unit">{data.unit}</span>
              <span className="growth-badge">
                {sales ? "↗" : "≈"}{" "}
                {sales
                  ? `${stats.growth > 0 ? "+" : ""}${stats.growth.toFixed(1).replace(".", ",")}%`
                  : "Стабильно"}
              </span>
            </div>
            <div className="kpi-caption">
              {sales ? "к предыдущему периоду" : "сервис работает штатно"}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">
              {sales ? "В среднем за день" : "Максимальное время"}
            </div>
            <div className="kpi-value secondary-value">
              {number(sales ? stats.average : stats.max)}
              <span className="kpi-unit">{data.unit}</span>
            </div>
            <div className="kpi-caption">
              {sales
                ? `за ${data.timeline.length} дней`
                : "пиковое значение за период"}
            </div>
          </div>
          <div className="kpi">
            <div className="kpi-label">
              {sales ? "Лучший день" : "Количество измерений"}
            </div>
            <div className="kpi-value secondary-value">
              {number(sales ? stats.max : data.timeline.length)}
              <span className="kpi-unit">{sales ? data.unit : "точек"}</span>
            </div>
            <div className="kpi-caption">
              {sales && data.timeline.length
                ? bestDay
                : "высокая детализация данных"}
            </div>
          </div>
        </div>
        <div className="plot-topline">
          <span>{`${sales ? "Выручка" : "Время ответа"}, ${data.unit}`}</span>
          <span>
            {data.timeline.length > 0 &&
              (sales
                ? `${date(data.timeline[0])} — ${date(data.timeline.at(-1)!)} ${new Date(data.timeline.at(-1)!).getUTCFullYear()}`
                : `Последние ${range} ч · UTC`)}
          </span>
        </div>
        <div
          className="chart-container"
          aria-label={
            sales
              ? "Линейный график выручки"
              : "Плотный временной ряд мониторинга"
          }
        >
          {loading ? (
            <ChartState kind="loading" />
          ) : error ? (
            <ChartState kind="error" message={error} retry={onRefresh} />
          ) : empty ? (
            <ChartState
              kind="empty"
              message={
                hidden.length === data.series.length
                  ? "Выберите серию под графиком"
                  : undefined
              }
            />
          ) : (
            <ChartKit
              key={`${mode}-${retry}`}
              type={sales ? "gravity-charts" : "yagr"}
              id="pulse-chart"
              data={chartData}
              renderPluginLoader={() => <ChartState kind="loading" />}
              renderError={({ resetError }) => (
                <ChartState
                  kind="error"
                  message="Не удалось загрузить график"
                  retry={() => {
                    resetError();
                    setRetry((n) => n + 1);
                  }}
                />
              )}
            />
          )}
        </div>
        <div className="chart-legend">
          {data.series.map((series) => (
            <Button
              key={series.id}
              view="flat"
              size="s"
              className={`legend-button ${hidden.includes(series.id) ? "legend-hidden" : ""}`}
              aria-pressed={!hidden.includes(series.id)}
              onClick={() => toggleSeries(series.id)}
            >
              <span
                className={`legend-line ${series.comparison ? "legend-comparison" : ""}`}
              />
              {series.name}
            </Button>
          ))}
          <span className="chart-hint">
            {sales
              ? "Наведите на график, чтобы увидеть детали"
              : "Выделите область для увеличения · двойной клик для сброса"}
          </span>
        </div>
        <div className="insight">
          <span className="insight-symbol">{sales ? "↗" : "∿"}</span>
          <p>
            {sales ? (
              <>
                <strong>Продажи набирают темп.</strong> Выручка на{" "}
                {stats.growth.toFixed(1).replace(".", ",")}% выше предыдущего
                периода.
              </>
            ) : (
              <>
                <strong>Сервис работает стабильно.</strong> Среднее время ответа
                — {number(stats.average)} мс за выбранный период.
              </>
            )}
          </p>
          <span className="insight-label">
            {sales ? "Тренд периода" : "Состояние сервиса"}
          </span>
        </div>
      </div>
      <div className="widget-footer">
        <span>
          <span className="status-dot" />
          Демонстрационные данные
        </span>
        <span aria-live="polite">
          Обновлено{" "}
          {updatedAt?.toLocaleTimeString("ru-RU", {
            hour: "2-digit",
            minute: "2-digit",
          }) ?? "—"}{" "}
          <span className="footer-dot">·</span> {number(data.timeline.length)}{" "}
          точек
        </span>
      </div>
    </section>
  );
}
